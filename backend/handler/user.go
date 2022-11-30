package handler

import (
	"errors"
	"fmt"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"
	"github.com/labstack/echo/v4"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"github.com/teamhanko/hanko/backend/audit_log"
	"github.com/teamhanko/hanko/backend/config"
	"github.com/teamhanko/hanko/backend/dto"
	"github.com/teamhanko/hanko/backend/persistence"
	"github.com/teamhanko/hanko/backend/persistence/models"
	"github.com/teamhanko/hanko/backend/session"
	"net/http"
	"strings"
)

type UserHandler struct {
	persister      persistence.Persister
	sessionManager session.Manager
	auditLogger    auditlog.Logger
	cfg            *config.Config
}

func NewUserHandler(cfg *config.Config, persister persistence.Persister, sessionManager session.Manager, auditLogger auditlog.Logger) *UserHandler {
	return &UserHandler{
		persister:      persister,
		auditLogger:    auditLogger,
		sessionManager: sessionManager,
		cfg:            cfg,
	}
}

type UserCreateBody struct {
	Email string `json:"email" validate:"required,email"`
}

func (h *UserHandler) Create(c echo.Context) error {
	var body UserCreateBody
	if err := (&echo.DefaultBinder{}).BindBody(c, &body); err != nil {
		return dto.ToHttpError(err)
	}

	if err := c.Validate(body); err != nil {
		return dto.ToHttpError(err)
	}

	body.Email = strings.ToLower(body.Email)

	return h.persister.Transaction(func(tx *pop.Connection) error {
		email, err := h.persister.GetEmailPersisterWithConnection(tx).FindByAddress(body.Email)
		if err != nil {
			return fmt.Errorf("failed to get user: %w", err)
		}

		if email != nil {
			return dto.NewHTTPError(http.StatusConflict).SetInternal(errors.New(fmt.Sprintf("user with email %s already exists", body.Email)))
		}

		newUser := models.NewUser()
		err = h.persister.GetUserPersisterWithConnection(tx).Create(newUser)
		if err != nil {
			return fmt.Errorf("failed to store user: %w", err)
		}

		newEmail := models.NewEmail(newUser.ID, body.Email)
		err = h.persister.GetEmailPersisterWithConnection(tx).Create(*newEmail)
		if err != nil {
			return fmt.Errorf("failed to store user: %w", err)
		}

		primaryEmail := models.NewPrimaryEmail(newEmail.ID, newUser.ID)
		err = h.persister.GetPrimaryEmailPersisterWithConnection(tx).Create(*primaryEmail)
		if err != nil {
			return fmt.Errorf("failed to store primary email: %w", err)
		}

		if !h.cfg.Emails.RequireVerification {
			token, err := h.sessionManager.GenerateJWT(newUser.ID)
			if err != nil {
				return fmt.Errorf("failed to generate jwt: %w", err)
			}

			cookie, err := h.sessionManager.GenerateCookie(token)
			if err != nil {
				return fmt.Errorf("failed to create session token: %w", err)
			}

			c.SetCookie(cookie)

			if h.cfg.Session.EnableAuthTokenHeader {
				c.Response().Header().Set("X-Auth-Token", token)
				c.Response().Header().Set("Access-Control-Expose-Headers", "X-Auth-Token")
			}
		}

		err = h.auditLogger.Create(c, models.AuditLogUserCreated, &newUser, nil)
		if err != nil {
			return fmt.Errorf("failed to write audit log: %w", err)
		}

		return c.JSON(http.StatusOK, newUser)
	})
}

func (h *UserHandler) Get(c echo.Context) error {
	userId := c.Param("id")

	sessionToken, ok := c.Get("session").(jwt.Token)
	if !ok {
		return errors.New("missing or malformed jwt")
	}

	if sessionToken.Subject() != userId {
		return dto.NewHTTPError(http.StatusForbidden).SetInternal(errors.New(fmt.Sprintf("user %s tried to get user %s", sessionToken.Subject(), userId)))
	}

	user, err := h.persister.GetUserPersister().Get(uuid.FromStringOrNil(userId))
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if user == nil {
		return dto.NewHTTPError(http.StatusNotFound).SetInternal(errors.New("user not found"))
	}

	return c.JSON(http.StatusOK, user)
}

type UserGetByEmailBody struct {
	Email string `json:"email" validate:"required,email"`
}

func (h *UserHandler) GetUserIdByEmail(c echo.Context) error {
	var request UserGetByEmailBody
	if err := (&echo.DefaultBinder{}).BindBody(c, &request); err != nil {
		return dto.ToHttpError(err)
	}

	if err := c.Validate(request); err != nil {
		return dto.ToHttpError(err)
	}

	email, err := h.persister.GetEmailPersister().FindByAddress(strings.ToLower(request.Email))
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	if email == nil {
		return dto.NewHTTPError(http.StatusNotFound).SetInternal(errors.New("user not found"))
	}

	return c.JSON(http.StatusOK, struct {
		UserId                string `json:"id"`
		Verified              bool   `json:"verified"`
		EmailId               string `json:"email_id"`
		HasWebauthnCredential bool   `json:"has_webauthn_credential"`
	}{
		UserId:                email.UserID.String(),
		Verified:              email.Verified,
		EmailId:               email.ID.String(),
		HasWebauthnCredential: len(email.User.WebauthnCredentials) > 0,
	})
}

func (h *UserHandler) Me(c echo.Context) error {
	sessionToken, ok := c.Get("session").(jwt.Token)
	if !ok {
		return errors.New("failed to cast session object")
	}

	return c.JSON(http.StatusOK, map[string]string{"id": sessionToken.Subject()})
}
