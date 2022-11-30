import * as preact from "preact";
import { createContext, h } from "preact";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "preact/compat";

import {
  HankoError,
  User,
  UserInfo,
  Emails,
} from "@teamhanko/hanko-frontend-sdk";

import { AppContext } from "./AppProvider";
import { PasswordContext } from "./PasswordProvider";
import { PasscodeContext } from "./PasscodeProvider";
import { TranslateContext } from "@denysvuika/preact-translate";
import { ProfileContext } from "./ProfileProvider";

import LoginEmail from "../pages/LoginEmail";
import LoginPasscode from "../pages/LoginPasscode";
import LoginPassword from "../pages/LoginPassword";
import ReAuth from "../pages/ReAuth";
import LoginFinished from "../pages/LoginFinished";
import RegisterConfirm from "../pages/RegisterConfirm";
import RegisterPassword from "../pages/RegisterPassword";
import RegisterAuthenticator from "../pages/RegisterAuthenticator";
import Profile from "../pages/Profile";
import Error from "../pages/Error";
import Initialize from "../pages/Initialize";

import Container from "../components/Container";
import Headline from "../components/Headline";
import Content from "../components/Content";

interface Props {
  lang?: string;
  entry: h.JSX.Element;
}

interface Context {
  emitSuccessEvent: () => void;
  renderReAuth: (user: User, emails: Emails) => void;
  eventuallyRenderEnrollment: (
    user: User,
    recoverPassword: boolean
  ) => Promise<boolean>;
  renderPassword: (user: UserInfo) => Promise<void>;
  renderPasscode: (
    userInfo: UserInfo,
    recoverPassword: boolean,
    isVerification?: boolean
  ) => Promise<void>;
  renderError: (e: HankoError) => void;
  renderLoginEmail: () => void;
  renderLoginFinished: () => void;
  renderRegisterConfirm: () => void;
  renderRegisterAuthenticator: () => void;
  renderProfile: () => Promise<void>;
  renderInitialize: () => void;
  renderHeadline: (text: string) => void;
}

export const RenderContext = createContext<Context>(null);

const PageProvider = ({ lang, entry }: Props) => {
  const { hanko } = useContext(AppContext);
  const { passwordInitialize } = useContext(PasswordContext);
  const { passcodeInitialize } = useContext(PasscodeContext);
  const { profileInitialize } = useContext(ProfileContext);
  const { setLang } = useContext(TranslateContext);

  const [page, setPage] = useState<h.JSX.Element>(entry);
  const [loginFinished, setLoginFinished] = useState<boolean>(false);
  const [headline, setHeadline] = useState<string>("");

  const emitSuccessEvent = useCallback(() => {
    setLoginFinished(true);
  }, []);

  const pages = useMemo(
    () => ({
      reAuth: (user: User, emails: Emails) =>
        setPage(<ReAuth emails={emails} user={user} />),
      loginEmail: () => setPage(<LoginEmail />),
      loginPasscode: (
        userInfo: UserInfo,
        recoverPassword: boolean,
        initialError?: HankoError,
        isVerification?: boolean
      ) =>
        setPage(
          <LoginPasscode
            userInfo={userInfo}
            recoverPassword={recoverPassword}
            initialError={initialError}
            isVerification={isVerification}
          />
        ),
      loginPassword: (userInfo: UserInfo, initialError: HankoError) =>
        setPage(
          <LoginPassword userInfo={userInfo} initialError={initialError} />
        ),
      registerConfirm: () => setPage(<RegisterConfirm />),
      registerPassword: (enrollWebauthn: boolean) =>
        setPage(<RegisterPassword registerAuthenticator={enrollWebauthn} />),
      registerAuthenticator: () => setPage(<RegisterAuthenticator />),
      loginFinished: () => setPage(<LoginFinished />),
      profile: () => setPage(<Profile />),
      error: (error: HankoError) => setPage(<Error initialError={error} />),
      initialize: () => setPage(<Initialize />),
    }),
    []
  );

  const renderReAuth = useCallback(
    (user: User, emails: Emails) => {
      pages.reAuth(user, emails);
    },
    [pages]
  );

  const renderLoginEmail = useCallback(() => {
    pages.loginEmail();
  }, [pages]);

  const renderLoginFinished = useCallback(() => {
    pages.loginFinished();
  }, [pages]);

  const renderPassword = useCallback(
    (userInfo: UserInfo) => {
      return new Promise<void>((resolve, reject) => {
        passwordInitialize(userInfo.id)
          .then((e) => pages.loginPassword(userInfo, e))
          .catch((e) => reject(e));
      });
    },
    [pages, passwordInitialize]
  );

  const renderPasscode = useCallback(
    (userInfo: UserInfo, recoverPassword: boolean, isVerification: boolean) =>
      passcodeInitialize(userInfo.id, userInfo.email_id, isVerification).then(
        (e) => {
          pages.loginPasscode(userInfo, recoverPassword, e, isVerification);
          return;
        }
      ),
    [pages, passcodeInitialize]
  );

  const eventuallyRenderEnrollment = useCallback(
    (user: User, recoverPassword: boolean) => {
      return new Promise<boolean>((resolve, reject) => {
        hanko.webauthn
          .shouldRegister(user)
          .then((shouldRegisterAuthenticator) => {
            let rendered = true;
            if (recoverPassword) {
              pages.registerPassword(shouldRegisterAuthenticator);
            } else if (shouldRegisterAuthenticator) {
              pages.registerAuthenticator();
            } else {
              rendered = false;
            }

            return resolve(rendered);
          })
          .catch((e) => reject(e));
      });
    },
    [hanko, pages]
  );

  const renderRegisterConfirm = useCallback(() => {
    pages.registerConfirm();
  }, [pages]);

  const renderRegisterAuthenticator = useCallback(() => {
    pages.registerAuthenticator();
  }, [pages]);

  const renderError = useCallback((e: HankoError) => pages.error(e), [pages]);

  const renderProfile = useCallback(
    () => profileInitialize().then(pages.profile).catch(pages.error),
    [pages.error, pages.profile, profileInitialize]
  );

  const renderInitialize = useCallback(() => {
    pages.initialize();
  }, [pages]);

  const renderHeadline = useCallback((text: string) => {
    setHeadline(text);
  }, []);

  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);

  return (
    <RenderContext.Provider
      value={{
        emitSuccessEvent,
        renderLoginEmail,
        renderLoginFinished,
        renderReAuth,
        renderPassword,
        renderPasscode,
        eventuallyRenderEnrollment,
        renderRegisterConfirm,
        renderRegisterAuthenticator,
        renderProfile,
        renderError,
        renderInitialize,
        renderHeadline,
      }}
    >
      <Container emitSuccessEvent={loginFinished}>
        <Content>
          <Headline>{headline}</Headline>
        </Content>
        {page}
      </Container>
    </RenderContext.Provider>
  );
};

export default PageProvider;
