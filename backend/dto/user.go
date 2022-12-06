package dto

import (
	"github.com/gofrs/uuid"
	"github.com/teamhanko/hanko/backend/persistence/models"
)

type CreateUserResponse struct {
	ID      uuid.UUID `json:"id"`
	EmailID uuid.UUID `json:"email_id"`
}

type GetUserResponse struct {
	ID                  uuid.UUID                   `json:"id"`
	WebauthnCredentials []models.WebauthnCredential `has_many:"webauthn_credentials" json:"webauthn_credentials,omitempty"`
}

type UserInfoResponse struct {
	ID                    uuid.UUID `json:"id"`
	EmailID               uuid.UUID `json:"email_id"`
	Verified              bool      `json:"verified"`
	HasWebauthnCredential bool      `json:"has_webauthn_credential"`
}
