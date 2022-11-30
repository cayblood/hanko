import * as preact from "preact";
import { Fragment } from "preact";

import {
  HankoError,
  Email,
  UnauthorizedError,
} from "@teamhanko/hanko-frontend-sdk";

import { useContext, useEffect, useMemo, useState } from "preact/compat";

import { TranslateContext } from "@denysvuika/preact-translate";
import { UserContext } from "../contexts/UserProvider";
import { ProfileContext } from "../contexts/ProfileProvider";
import { AppContext } from "../contexts/AppProvider";
import { RenderContext } from "../contexts/PageProvider";

import ErrorMessage from "../components/ErrorMessage";
import Content from "../components/Content";
import EmailTable from "../components/EmailTable";
import Form from "../components/Form";
import InputText from "../components/InputText";
import Button from "../components/Button";
import Select from "../components/Select";
import SubHeadline from "../components/SubHeadline";

const Profile = () => {
  const { t } = useContext(TranslateContext);
  const { hanko, config } = useContext(AppContext);
  const { user } = useContext(UserContext);
  const { emails, profileInitialize } = useContext(ProfileContext);
  const { renderHeadline, renderReAuth } = useContext(RenderContext);
  const [error, setError] = useState<HankoError>();
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPrimaryEmailValue, setNewPrimaryEmailValue] = useState<string>("");
  const [deleteEmailValue, setDeleteEmailValue] = useState<string>("");
  const [newPrimaryEmail, setNewPrimaryEmail] = useState<Email>(null);
  const [newPassword, setNewPassword] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isNewEmailLoading, setIsNewEmailLoading] = useState<boolean>(false);

  const addEmail = (event: Event) => {
    event.preventDefault();
    setIsNewEmailLoading(true);
    hanko.email
      .create(newEmail)
      .then(() => {
        return profileInitialize();
      })
      .then(() => {
        setNewEmail("");
        setIsNewEmailLoading(false);
        return;
      })
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          return renderReAuth(user, emails);
        }

        setError(e);
        setIsNewEmailLoading(false);
      });
  };

  const onNewEmailInput = (event: Event) => {
    event.preventDefault();
    if (event.target instanceof HTMLInputElement) {
      setNewEmail(event.target.value);
    }
  };

  const onSelectPrimaryEmail = (e: Email) => {
    setNewPrimaryEmail(e);
    setNewPrimaryEmailValue(e.id);
  };

  const onSelectDeleteEmail = (e: Email) => {
    setDeleteEmailValue(e.id);
  };

  const saveNewPrimaryEmail = (event: Event) => {
    event.preventDefault();
    hanko.email
      .update(newPrimaryEmail.id, true)
      .then(() => profileInitialize())
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          return renderReAuth(user, emails);
        }

        setError(e);
      });

    setNewPrimaryEmailValue("");
    if (newPrimaryEmail.id === deleteEmailValue) {
      setDeleteEmailValue("");
    }
  };

  const deleteEmail = (event: Event) => {
    event.preventDefault();
    hanko.email
      .delete(deleteEmailValue)
      .then(() => profileInitialize())
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          return renderReAuth(user, emails);
        }
        setError(e);
      });

    setDeleteEmailValue("");
    if (deleteEmailValue === newPrimaryEmail.id) {
      setNewPrimaryEmailValue("");
    }
  };

  const changePassword = (event: Event) => {
    event.preventDefault();
    hanko.password
      .update(newPassword)
      .then(() => {
        setNewPassword("");
        return;
      })
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          return renderReAuth(user, emails);
        }
        setError(e);
      });
  };

  const onNewPasswordInput = (event: Event) => {
    event.preventDefault();
    if (event.target instanceof HTMLInputElement) {
      setNewPassword(event.target.value);
    }
  };

  const potentialPrimaryEmails = useMemo(
    () =>
      emails.filter((e) => {
        if (config.emails.require_verification) {
          return e.is_verified && !e.is_primary;
        }
        return !e.is_primary;
      }),
    [config.emails.require_verification, emails]
  );

  const deletableEmails = useMemo(
    () => emails.filter((e) => !e.is_primary),
    [emails]
  );

  useEffect(() => {
    setIsDisabled(isNewEmailLoading);
  }, [isNewEmailLoading]);

  useEffect(() => {
    setError(null);
  }, [emails, hanko]);

  useEffect(() => renderHeadline(t("headlines.profile")), [renderHeadline, t]);

  return (
    <Content>
      <ErrorMessage error={error} />
      <SubHeadline>Emails</SubHeadline>
      <EmailTable emails={emails} setError={setError} />
      <Form onSubmit={addEmail}>
        <InputText
          type={"email"}
          label={"Add new email"}
          onInput={onNewEmailInput}
          value={newEmail}
          required
        />
        <Button disabled={isDisabled}>Save</Button>
      </Form>
      {potentialPrimaryEmails.length ? (
        <Form onSubmit={saveNewPrimaryEmail}>
          <Select
            label={"Set primary email"}
            hint={"Select..."}
            data={potentialPrimaryEmails}
            onSelect={onSelectPrimaryEmail}
            valueSelector={(e) => e.id}
            textSelector={(e) => e.address}
            value={newPrimaryEmailValue}
          />
          <Button disabled={isDisabled}>Save</Button>
        </Form>
      ) : null}
      {deletableEmails.length ? (
        <Form onSubmit={deleteEmail}>
          <Select
            label={"Delete email"}
            hint={"Select..."}
            data={deletableEmails}
            onSelect={onSelectDeleteEmail}
            valueSelector={(e) => e.id}
            textSelector={(e) => e.address}
            value={deleteEmailValue}
          />
          <Button disabled={isDisabled}>Delete</Button>
        </Form>
      ) : null}
      {config.password.enabled ? (
        <Fragment>
          <SubHeadline>Passwords</SubHeadline>
          <Form onSubmit={changePassword}>
            <InputText
              minLength={config.password.min_password_length}
              maxLength={72}
              label={"New password"}
              value={newPassword}
              onInput={onNewPasswordInput}
              type={"password"}
            />
            <Button disabled={isDisabled}>Save</Button>
          </Form>
        </Fragment>
      ) : null}
    </Content>
  );
};

export default Profile;
