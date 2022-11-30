import * as preact from "preact";
import { Fragment } from "preact";
import AppProvider from "../contexts/AppProvider";
import { TranslateProvider } from "@denysvuika/preact-translate";

import { Props } from "../HankoAuth";
import { translations } from "../Translations";

import UserProvider from "../contexts/UserProvider";
import PasswordProvider from "../contexts/PasswordProvider";
import PasscodeProvider from "../contexts/PasscodeProvider";
import ProfileProvider from "../contexts/ProfileProvider";
import PageProvider from "../contexts/PageProvider";

import Initialize from "../pages/Initialize";

export type ComponentName = "auth" | "re-auth" | "profile";

interface AppEntryProps extends Props {
  componentName: ComponentName;
  fallbackLang?: string;
}

export const AppEntry = ({
  api,
  lang = "en",
  componentName = "auth",
  fallbackLang = "en",
}: AppEntryProps) => {
  return (
    <Fragment>
      <AppProvider api={api} componentName={componentName}>
        <TranslateProvider
          translations={translations}
          fallbackLang={fallbackLang}
        >
          <UserProvider>
            <PasswordProvider>
              <PasscodeProvider>
                <ProfileProvider>
                  <PageProvider lang={lang} entry={<Initialize />} />
                </ProfileProvider>
              </PasscodeProvider>
            </PasswordProvider>
          </UserProvider>
        </TranslateProvider>
      </AppProvider>
    </Fragment>
  );
};
