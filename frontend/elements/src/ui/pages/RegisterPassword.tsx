import * as preact from "preact";
import { useContext, useEffect, useState } from "preact/compat";

import { HankoError, UnauthorizedError } from "@teamhanko/hanko-frontend-sdk";

import { TranslateContext } from "@denysvuika/preact-translate";
import { AppContext } from "../contexts/AppProvider";
import { RenderContext } from "../contexts/PageProvider";

import Content from "../components/Content";
import Form from "../components/Form";
import InputText from "../components/InputText";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import Paragraph from "../components/Paragraph";

type Props = {
  registerAuthenticator: boolean;
};

const RegisterPassword = ({ registerAuthenticator }: Props) => {
  const { t } = useContext(TranslateContext);
  const { hanko, config } = useContext(AppContext);
  const {
    renderError,
    emitSuccessEvent,
    renderRegisterAuthenticator,
    renderHeadline,
  } = useContext(RenderContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<HankoError>(null);
  const [password, setPassword] = useState<string>("");

  const onPasswordInput = async (event: Event) => {
    if (event.target instanceof HTMLInputElement) {
      setPassword(event.target.value);
    }
  };

  const onPasswordSubmit = (event: Event) => {
    event.preventDefault();
    setIsLoading(true);

    hanko.password
      .update(password)
      .then(() => {
        if (registerAuthenticator) {
          renderRegisterAuthenticator();
        } else {
          emitSuccessEvent();
          setIsSuccess(true);
        }

        setIsLoading(false);

        return;
      })
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          renderError(e);

          return;
        }

        setIsLoading(false);
        setError(e);
      });
  };

  useEffect(
    () => renderHeadline(t("headlines.registerPassword")),
    [renderHeadline, t]
  );

  return (
    <Content>
      <ErrorMessage error={error} />
      <Paragraph>{t("texts.passwordFormatHint")}</Paragraph>
      <Form onSubmit={onPasswordSubmit}>
        <InputText
          type={"password"}
          name={"password"}
          autocomplete={"new-password"}
          minLength={config.password.min_password_length}
          maxLength={72}
          required={true}
          label={t("labels.password")}
          onInput={onPasswordInput}
          disabled={isSuccess || isLoading}
          autofocus
        />
        <Button isSuccess={isSuccess} isLoading={isLoading}>
          {t("labels.continue")}
        </Button>
      </Form>
    </Content>
  );
};

export default RegisterPassword;
