import * as preact from "preact";
import registerCustomElement from "preact-custom-element";

import { AppEntry } from "./components/AppEntry";

export interface Props {
  api: string;
  lang?: string;
}

declare interface HankoAuthElement
  extends preact.JSX.HTMLAttributes<HTMLElement>,
    Props {}

declare interface HankoReAuthElement
  extends preact.JSX.HTMLAttributes<HTMLElement>,
    Props {}

declare interface HankoProfileElement
  extends preact.JSX.HTMLAttributes<HTMLElement>,
    Props {}

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace JSX {
    // eslint-disable-next-line no-unused-vars
    interface IntrinsicElements {
      "hanko-auth": HankoAuthElement;
      "hanko-re-auth": HankoReAuthElement;
      "hanko-profile": HankoProfileElement;
    }
  }
}

const styles = window._hankoStyle;

export const HankoAuth = ({ api, lang }: Props) => {
  return <AppEntry componentName={"auth"} api={api} lang={lang} />;
};

export const HankoReAuth = ({ api, lang }: Props) => {
  return <AppEntry componentName={"re-auth"} api={api} lang={lang} />;
};

export const HankoProfile = ({ api, lang }: Props) => {
  return <AppEntry componentName={"profile"} api={api} lang={lang} />;
};

export interface RegisterOptions {
  shadow?: boolean;
  injectStyles?: boolean;
}

export const register = ({
  shadow = true,
  injectStyles = true,
}: RegisterOptions) =>
  Promise.all([
    _register({
      tagName: "hanko-auth",
      entry: HankoAuth,
      shadow,
      injectStyles,
    }),
    _register({
      tagName: "hanko-re-auth",
      entry: HankoReAuth,
      shadow,
      injectStyles,
    }),
    _register({
      tagName: "hanko-profile",
      entry: HankoProfile,
      shadow,
      injectStyles,
    }),
  ]);

interface InternalRegisterOptions extends RegisterOptions {
  tagName: string;
  entry: preact.FunctionalComponent<Props>;
}

const _register = async ({
  tagName,
  entry,
  shadow,
  injectStyles,
}: InternalRegisterOptions) => {
  if (!customElements.get(tagName)) {
    registerCustomElement(entry, tagName, ["api", "lang"], {
      shadow,
    });
  }

  if (injectStyles) {
    await customElements.whenDefined(tagName);
    const elements = document.getElementsByTagName(tagName);

    Array.from(elements).forEach((element) => {
      if (shadow) {
        const clonedStyles = styles.cloneNode(true);
        element.shadowRoot.appendChild(clonedStyles);
      } else {
        element.appendChild(styles);
      }
    });
  }
};
