import * as preact from "preact";
import { FunctionalComponent, RenderableProps } from "preact";
import { useContext } from "preact/compat";
import { User } from "@teamhanko/hanko-frontend-sdk";
import { TranslateContext } from "@denysvuika/preact-translate";

import Link, { Props as LinkProps } from "../Link";

interface Props {
  user: User;
}

const linkToLoginReAuth = <P extends Props & LinkProps>(
  LinkComponent: FunctionalComponent<LinkProps>
) => {
  return function LinkToEmailLogin(props: RenderableProps<P>) {
    const { t } = useContext(TranslateContext);

    const onClick = () => {
      // renderReAuth(props.user);
    };

    return (
      <LinkComponent onClick={onClick} {...props}>
        {t("labels.back")}
      </LinkComponent>
    );
  };
};

export default linkToLoginReAuth<Props & LinkProps>(Link);
