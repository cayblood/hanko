import * as preact from "preact";
import { FunctionalComponent, RenderableProps } from "preact";
import { useContext } from "preact/compat";

import { UserInfo } from "@teamhanko/hanko-frontend-sdk";

import { TranslateContext } from "@denysvuika/preact-translate";
import { RenderContext } from "../../contexts/PageProvider";

import Link, { Props as LinkProps } from "../Link";

interface Props {
  userInfo: UserInfo;
}

const linkToPasswordLogin = <P extends Props & LinkProps>(
  LinkComponent: FunctionalComponent<LinkProps>
) => {
  return function LinkToPasswordLogin(props: RenderableProps<P>) {
    const { t } = useContext(TranslateContext);
    const { renderPassword, renderError } = useContext(RenderContext);

    const onClick = () => {
      renderPassword(props.userInfo).catch((e) => renderError(e));
    };

    return (
      <LinkComponent onClick={onClick} {...props}>
        {t("labels.back")}
      </LinkComponent>
    );
  };
};

export default linkToPasswordLogin<Props & LinkProps>(Link);
