import * as preact from "preact";
import { Fragment } from "preact";
import { useContext, useEffect, useState } from "preact/compat";

import {
  HankoError,
  PasscodeExpiredError,
  TechnicalError,
  UnauthorizedError,
  UserInfo,
} from "@teamhanko/hanko-frontend-sdk";

import { UserContext } from "../contexts/UserProvider";
import { PasscodeContext } from "../contexts/PasscodeProvider";
import { TranslateContext } from "@denysvuika/preact-translate";
import { RenderContext } from "../contexts/PageProvider";
import { ProfileContext } from "../contexts/ProfileProvider";

import Button from "../components/Button";
import Content from "../components/Content";
import Form from "../components/Form";
import Footer from "../components/Footer";
import InputPasscode from "../components/InputPasscode";
import ErrorMessage from "../components/ErrorMessage";
import Paragraph from "../components/Paragraph";

import LoadingIndicatorLink from "../components/link/withLoadingIndicator";
import LinkToProfile from "../components/link/toProfile";
import LinkToEmailLogin from "../components/link/toEmailLogin";
import LinkToPasswordLogin from "../components/link/toPasswordLogin";

import { AppContext } from "../contexts/AppProvider";
import SubHeadline from "../components/SubHeadline";

type Props = {
  userInfo: UserInfo;
  recoverPassword: boolean;
  numberOfDigits?: number;
  isVerification?: boolean;
  initialError?: HankoError;
};

const LoginPasscode = ({
  userInfo,
  recoverPassword = false,
  isVerification = false,
  numberOfDigits = 6,
  initialError,
}: Props) => {
  const { componentName } = useContext(AppContext);
  const { t } = useContext(TranslateContext);
  const {
    eventuallyRenderEnrollment,
    emitSuccessEvent,
    renderProfile,
    renderHeadline,
    renderReAuth,
  } = useContext(RenderContext);
  const { userInitialize, emailAddress, user } = useContext(UserContext);
  const { emails } = useContext(ProfileContext);
  const {
    passcodeTTL,
    passcodeIsActive,
    passcodeResendAfter,
    passcodeResend,
    passcodeFinalize,
  } = useContext(PasscodeContext);

  const [isPasscodeLoading, setIsPasscodeLoading] = useState<boolean>(false);
  const [isPasscodeSuccess, setIsPasscodeSuccess] = useState<boolean>(false);
  const [isResendLoading, setIsResendLoading] = useState<boolean>(false);
  const [isResendSuccess, setIsResendSuccess] = useState<boolean>(false);
  const [passcodeDigits, setPasscodeDigits] = useState<string[]>([]);
  const [error, setError] = useState<HankoError>(initialError);

  const onPasscodeInput = (digits: string[]) => {
    // Automatically submit the Passcode when every input contains a digit.
    if (digits.filter((digit) => digit !== "").length === numberOfDigits) {
      passcodeSubmit(digits);
    }

    setPasscodeDigits(digits);
  };

  const passcodeSubmit = (code: string[]) => {
    setIsPasscodeLoading(true);

    passcodeFinalize(userInfo.id, code.join(""))
      .then(() => userInitialize())
      .then((u) => {
        if (componentName === "auth") {
          return eventuallyRenderEnrollment(u, recoverPassword);
        }
        return false;
      })
      .then((rendered) => {
        if (!rendered) {
          setIsPasscodeSuccess(true);
          setIsPasscodeLoading(false);
          if (componentName === "auth") {
            emitSuccessEvent();
          }
        }

        if (componentName === "profile") {
          return renderProfile();
        }

        return;
      })
      .catch((e) => {
        // Clear Passcode digits when there is no technical error.
        if (!(e instanceof TechnicalError)) {
          setPasscodeDigits([]);
        }

        setIsPasscodeSuccess(false);
        setIsPasscodeLoading(false);
        setError(e);
      });
  };

  const onPasscodeSubmitClick = (event: Event) => {
    event.preventDefault();
    passcodeSubmit(passcodeDigits);
  };

  const onResendClick = (event: Event) => {
    event.preventDefault();
    setIsResendSuccess(false);
    setIsResendLoading(true);

    passcodeResend(userInfo.id, userInfo.email_id, isVerification)
      .then(() => {
        setIsResendSuccess(true);
        setPasscodeDigits([]);
        setIsResendLoading(false);
        setError(null);

        return;
      })
      .catch((e) => {
        setIsResendLoading(false);
        setIsResendSuccess(false);

        if (componentName === "profile" && e instanceof UnauthorizedError) {
          return renderReAuth(user, emails);
        }

        setError(e);
      });
  };

  useEffect(() => {
    if (passcodeTTL <= 0 && !isPasscodeSuccess) {
      setError(new PasscodeExpiredError());
    }
  }, [isPasscodeSuccess, passcodeTTL]);

  useEffect(() => {
    const text = componentName === "profile" ? "profile" : "loginPasscode";
    renderHeadline(t(`headlines.${text}`));
  }, [componentName, renderHeadline, t]);

  return (
    <Fragment>
      <Content>
        {componentName === "profile" && (
          <SubHeadline>{t("headlines.loginPasscode")}</SubHeadline>
        )}
        <ErrorMessage error={error} />
        <Paragraph>{t("texts.enterPasscode", { emailAddress })}</Paragraph>
        <Form onSubmit={onPasscodeSubmitClick}>
          <InputPasscode
            onInput={onPasscodeInput}
            passcodeDigits={passcodeDigits}
            numberOfInputs={numberOfDigits}
            disabled={
              passcodeTTL <= 0 ||
              !passcodeIsActive ||
              isPasscodeLoading ||
              isPasscodeSuccess ||
              isResendLoading
            }
          />
          <Button
            disabled={passcodeTTL <= 0 || !passcodeIsActive || isResendLoading}
            isLoading={isPasscodeLoading}
            isSuccess={isPasscodeSuccess}
          >
            {t("labels.signIn")}
          </Button>
        </Form>
      </Content>
      <Footer>
        {recoverPassword ? (
          <LinkToPasswordLogin
            userInfo={userInfo}
            disabled={isResendLoading || isPasscodeLoading || isPasscodeSuccess}
          />
        ) : componentName === "profile" ? (
          <LinkToProfile
            disabled={isResendLoading || isPasscodeLoading || isPasscodeSuccess}
          />
        ) : (
          <LinkToEmailLogin
            disabled={isResendLoading || isPasscodeLoading || isPasscodeSuccess}
          />
        )}
        <LoadingIndicatorLink
          disabled={
            passcodeResendAfter > 0 ||
            isResendLoading ||
            isPasscodeLoading ||
            isPasscodeSuccess
          }
          onClick={onResendClick}
          isLoading={isResendLoading}
          isSuccess={isResendSuccess}
        >
          {passcodeResendAfter > 0
            ? t("labels.passcodeResendAfter", {
                passcodeResendAfter,
              })
            : t("labels.sendNewPasscode")}
        </LoadingIndicatorLink>
      </Footer>
    </Fragment>
  );
};

export default LoginPasscode;
