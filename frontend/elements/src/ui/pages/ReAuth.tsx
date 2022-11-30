import * as preact from "preact";
import { useContext, useEffect, useMemo, useState } from "preact/compat";
import { Fragment } from "preact";

import {
  HankoError,
  TechnicalError,
  WebauthnSupport,
  User,
  Email,
  Emails,
  UserInfo,
} from "@teamhanko/hanko-frontend-sdk";

import { TranslateContext } from "@denysvuika/preact-translate";
import { AppContext } from "../contexts/AppProvider";
import { RenderContext } from "../contexts/PageProvider";

import Button from "../components/Button";
import Content from "../components/Content";
import Form from "../components/Form";
import ErrorMessage from "../components/ErrorMessage";
import SubHeadline from "../components/SubHeadline";
import Select from "../components/Select";
import { UserContext } from "../contexts/UserProvider";
import InputText from "../components/InputText";
import Footer from "../components/Footer";
import Link from "../components/Link";
import Divider from "../components/Divider";

interface Props {
  user: User;
  emails: Emails;
}

const ReAuth = ({ user, emails }: Props) => {
  const { t } = useContext(TranslateContext);
  const { renderHeadline, renderPasscode, renderProfile } =
    useContext(RenderContext);
  const { hanko, config, componentName } = useContext(AppContext);
  const { setEmailAddress } = useContext(UserContext);

  const [isPasskeyLoginLoading, setIsPasskeyLoginLoading] =
    useState<boolean>(false);
  const [isPasscodeLoginLoading, setIsPasscodeLoginLoading] =
    useState<boolean>(false);
  const [isPasswordLoginLoading, setIsPasswordLoginLoading] =
    useState<boolean>(false);
  const [error, setError] = useState<HankoError>(null);
  const [isAuthenticatorSupported, setIsAuthenticatorSupported] =
    useState<boolean>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email>(null);
  const [password, setPassword] = useState<string>("");

  // isAndroidUserAgent is used to determine whether the "Login with Passkey" button should be visible, as there is
  // currently no resident key support on Android.
  const isAndroidUserAgent =
    window.navigator.userAgent.indexOf("Android") !== -1;

  const buttonsDisabled = useMemo(
    () =>
      isPasscodeLoginLoading || isPasskeyLoginLoading || isPasswordLoginLoading,
    [isPasscodeLoginLoading, isPasskeyLoginLoading, isPasswordLoginLoading]
  );

  const onPasskeySubmit = (event: Event) => {
    event.preventDefault();
    setIsPasskeyLoginLoading(true);
    hanko.webauthn
      .login(user.id)
      .then(() => {
        setIsPasskeyLoginLoading(false);
        return renderProfile();
      })
      .catch((e) => {
        setIsPasskeyLoginLoading(false);
        setError(e);
      });
  };

  const onPasscodeEmailSelect = (email: Email) => {
    setSelectedEmail(email);
  };

  const onPasscodeSubmit = (event: Event) => {
    const email = selectedEmail || primaryEmail;
    const userInfo: UserInfo = {
      id: user.id,
      verified: true,
      email_id: email.id,
      has_webauthn_credential: false,
    };

    event.preventDefault();
    setEmailAddress(email.address);
    setIsPasscodeLoginLoading(true);
    renderPasscode(userInfo, false, false)
      .then(() => setIsPasscodeLoginLoading(false))
      .catch((e) => {
        setIsPasscodeLoginLoading(false);
        setError(e);
      });
  };

  const potentialPasscodeEmails = useMemo(
    () =>
      emails.filter((e) => {
        if (config.emails.require_verification) {
          return e.is_verified;
        }
        return true;
      }),
    [config.emails.require_verification, emails]
  );

  const primaryEmail = useMemo(
    () => potentialPasscodeEmails.filter((e) => e.is_primary)[0],
    [potentialPasscodeEmails]
  );

  const onPasswordSubmit = (event: Event) => {
    event.preventDefault();
    setIsPasswordLoginLoading(true);
    hanko.password
      .login(user.id, password)
      .then(() => {
        setIsPasswordLoginLoading(false);
        return renderProfile();
      })
      .catch((e) => {
        setIsPasswordLoginLoading(false);
        setError(e);
      });
  };

  const onPasswordInput = (event: Event) => {
    event.preventDefault();
    if (event.target instanceof HTMLInputElement) {
      setPassword(event.target.value);
    }
  };

  const showPasskeyButton = useMemo(
    () =>
      isAuthenticatorSupported &&
      !isAndroidUserAgent &&
      user.webauthn_credentials &&
      user.webauthn_credentials.length,
    [isAndroidUserAgent, isAuthenticatorSupported, user.webauthn_credentials]
  );

  useEffect(() => {
    WebauthnSupport.isPlatformAuthenticatorAvailable()
      .then((supported) => setIsAuthenticatorSupported(supported))
      .catch((e) => setError(new TechnicalError(e)));
  }, []);

  useEffect(() => {
    const headline = componentName === "profile" ? "profile" : "reAuth";
    renderHeadline(t(`headlines.${headline}`));
  }, [componentName, renderHeadline, t]);

  return (
    <Fragment>
      <Content>
        {componentName === "profile" ? (
          <SubHeadline>{t("headlines.reAuth")}</SubHeadline>
        ) : null}
        <ErrorMessage error={error} />
        {showPasskeyButton ? (
          <Fragment>
            <Form onSubmit={onPasskeySubmit}>
              <Button
                isLoading={isPasskeyLoginLoading}
                disabled={buttonsDisabled}
              >
                {"Use a passkey"}
              </Button>
            </Form>
            <Divider />
          </Fragment>
        ) : null}
        <Form onSubmit={onPasscodeSubmit}>
          <Select
            data={potentialPasscodeEmails}
            valueSelector={(e) => e.id}
            textSelector={(e) => e.address}
            onSelect={onPasscodeEmailSelect}
            label={"Passcode email"}
            value={(selectedEmail && selectedEmail.id) || primaryEmail.id}
          />
          <Button isLoading={isPasscodeLoginLoading} disabled={buttonsDisabled}>
            {t("labels.continue")}
          </Button>
        </Form>
        {config.password.enabled ? (
          <Fragment>
            <Divider />
            <Form onSubmit={onPasswordSubmit}>
              <InputText
                type={"password"}
                onInput={onPasswordInput}
                value={password}
                label={"Password"}
                disabled={buttonsDisabled}
              />
              <Button disabled={buttonsDisabled}>{t("labels.continue")}</Button>
            </Form>
          </Fragment>
        ) : null}
      </Content>
      <Footer>
        <Link onClick={() => renderProfile()}>Back</Link>
      </Footer>
    </Fragment>
  );
};

export default ReAuth;
