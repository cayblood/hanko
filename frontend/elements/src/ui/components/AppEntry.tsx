import * as preact from "preact";
import { h, Fragment } from "preact";
import AppProvider from "../contexts/AppProvider";
import { TranslateProvider } from "@denysvuika/preact-translate";
import { translations } from "../Translations";
import UserProvider from "../contexts/UserProvider";
import PasswordProvider from "../contexts/PasswordProvider";
import PasscodeProvider from "../contexts/PasscodeProvider";
import PageProvider from "../contexts/PageProvider";
import { Props } from "../HankoAuth";

interface AppEntryProps extends Props {
  entry: h.JSX.Element;
  fallbackLang?: string;
}

export const AppEntry = ({
  api,
  lang = "en",
  entry,
  mode,
  fallbackLang = "en",
}: AppEntryProps) => {
  return (
    <Fragment>
      <AppProvider api={api} mode={mode}>
        <TranslateProvider
          translations={translations}
          fallbackLang={fallbackLang}
        >
          <UserProvider>
            <PasswordProvider>
              <PasscodeProvider>
                <PageProvider lang={lang} entry={entry} />
              </PasscodeProvider>
            </PasswordProvider>
          </UserProvider>
        </TranslateProvider>
      </AppProvider>
    </Fragment>
  );
};
