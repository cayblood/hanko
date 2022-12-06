import * as preact from "preact";
import { Fragment } from "preact";
import { useContext, useEffect, useState } from "preact/compat";

import { User, HankoError, UserInfo } from "@teamhanko/hanko-frontend-sdk";

import { AppContext } from "../contexts/AppProvider";
import { TranslateContext } from "@denysvuika/preact-translate";
import { UserContext } from "../contexts/UserProvider";
import { RenderContext } from "../contexts/PageProvider";

import Content from "../components/Content";
import Form from "../components/Form";
import Button from "../components/Button";
import Footer from "../components/Footer";
import ErrorMessage from "../components/ErrorMessage";
import Paragraph from "../components/Paragraph";

import LinkToEmailLogin from "../components/link/toEmailLogin";

const RegisterConfirm = () => {
  const { t } = useContext(TranslateContext);
  const { hanko, config } = useContext(AppContext);
  const { emailAddress } = useContext(UserContext);
  const {
    renderPasscode,
    emitSuccessEvent,
    renderHeadline,
    eventuallyRenderEnrollment,
  } = useContext(RenderContext);

  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [error, setError] = useState<HankoError>(null);

  const onConfirmSubmit = (event: Event) => {
    event.preventDefault();
    setIsLoading(true);
    hanko.user.create(emailAddress).then(setUser).catch(setError);
  };

  // User has been created
  useEffect(() => {
    if (!user || !config) return;
    if (config.emails.require_verification) {
      const userInfo: UserInfo = {
        id: user.id,
        email_id: user.email_id,
        verified: false,
        has_webauthn_credential: false,
      };
      renderPasscode(userInfo, config.password.enabled).catch((e) => {
        setIsLoading(false);
        setError(e);
      });
    } else {
      eventuallyRenderEnrollment(user, config.password.enabled)
        .then((rendered) => {
          if (!rendered) {
            setIsSuccess(true);
            setIsLoading(false);
            emitSuccessEvent();
          }
          return;
        })
        .catch((e) => {
          setIsLoading(false);
          setError(e);
        });
    }
  }, [
    config,
    emailAddress,
    emitSuccessEvent,
    eventuallyRenderEnrollment,
    renderPasscode,
    user,
  ]);

  useEffect(
    () => renderHeadline(t("headlines.registerConfirm")),
    [renderHeadline, t]
  );

  return (
    <Fragment>
      <Content>
        <ErrorMessage error={error} />
        <Paragraph>{t("texts.createAccount", { emailAddress })}</Paragraph>
        <Form onSubmit={onConfirmSubmit}>
          <Button autofocus isLoading={isLoading} isSuccess={isSuccess}>
            {t("labels.signUp")}
          </Button>
        </Form>
      </Content>
      <Footer>
        <span hidden />
        <LinkToEmailLogin disabled={isLoading} />
      </Footer>
    </Fragment>
  );
};

export default RegisterConfirm;
