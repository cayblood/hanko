import * as preact from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/compat";
import { Fragment } from "preact";

import {
  HankoError,
  TechnicalError,
  WebauthnSupport,
} from "@teamhanko/hanko-frontend-sdk";

import { TranslateContext } from "@denysvuika/preact-translate";
import { AppContext } from "../contexts/AppProvider";
import { RenderContext } from "../contexts/PageProvider";
import { UserContext } from "../contexts/UserProvider";

import Button from "../components/Button";
import Headline from "../components/Headline";
import Content from "../components/Content";
import Form from "../components/Form";
import ErrorMessage from "../components/ErrorMessage";

const LoginReAuth = () => {
  const { t } = useContext(TranslateContext);
  const { user, setEmail } = useContext(UserContext);
  const { hanko, config } = useContext(AppContext);
  const { renderPassword, renderPasscode } = useContext(RenderContext);

  const [isPasskeyLoginLoading, setIsPasskeyLoginLoading] =
    useState<boolean>(false);
  const [isPasskeyLoginSuccess, setIsPasskeyLoginSuccess] =
    useState<boolean>(false);
  const [isPasscodeLoginLoading, setIsPasscodeLoginLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<HankoError>(null);
  const [isAuthenticatorSupported, setIsAuthenticatorSupported] =
    useState<boolean>(null);

  // isAndroidUserAgent is used to determine whether the "Login with Passkey" button should be visible, as there is
  // currently no resident key support on Android.
  const isAndroidUserAgent =
    window.navigator.userAgent.indexOf("Android") !== -1;

  const buttonsDisabled = useMemo(
    () =>
      isPasscodeLoginLoading || isPasskeyLoginLoading || isPasskeyLoginSuccess,
    [isPasscodeLoginLoading, isPasskeyLoginLoading, isPasskeyLoginSuccess]
  );

  const onPasskeySubmit = (event: Event) => {
    event.preventDefault();
    setIsPasskeyLoginLoading(true);
    console.log(user);
    hanko.webauthn
      .login(user.id)
      .then(() => {
        setIsPasskeyLoginLoading(false);
        setIsPasskeyLoginSuccess(true);
        return;
      })
      .catch((e) => {
        setIsPasskeyLoginLoading(false);
        setIsPasskeyLoginSuccess(false);
        setError(e);
      });
  };

  const onPasswordSubmit = (event: Event) => {
    event.preventDefault();
    renderPassword(user.id).catch((e) => setError(e));
  };

  const onPasscodeSubmit = (event: Event) => {
    event.preventDefault();
    setEmail(user.email);
    setIsPasscodeLoginLoading(true);
    renderPasscode(user.id, false)
      .then(() => setError(null))
      .catch((e) => setError(e));
  };

  useEffect(() => {
    WebauthnSupport.isPlatformAuthenticatorAvailable()
      .then((supported) => setIsAuthenticatorSupported(supported))
      .catch((e) => setError(new TechnicalError(e)));
  }, []);

  return (
    <Content>
      <Headline>{t("headlines.loginReAuth")}</Headline>
      <ErrorMessage error={error} />
      {isAuthenticatorSupported &&
      !isAndroidUserAgent &&
      user.webauthn_credentials.length ? (
        <Fragment>
          <Form onSubmit={onPasskeySubmit}>
            <Button
              isLoading={isPasskeyLoginLoading}
              isSuccess={isPasskeyLoginSuccess}
              disabled={buttonsDisabled}
            >
              {t("labels.signInPasskey")}
            </Button>
          </Form>
        </Fragment>
      ) : null}
      <Form onSubmit={onPasscodeSubmit}>
        <Button isLoading={isPasscodeLoginLoading} disabled={buttonsDisabled}>
          {t("labels.signInPasscode")}
        </Button>
      </Form>
      {config.password.enabled ? (
        <Fragment>
          <Form onSubmit={onPasswordSubmit}>
            <Button disabled={buttonsDisabled}>
              {t("labels.signInPassword")}
            </Button>
          </Form>
        </Fragment>
      ) : null}
    </Content>
  );
};

export default LoginReAuth;
