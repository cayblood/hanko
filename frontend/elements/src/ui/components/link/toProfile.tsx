import * as preact from "preact";
import { FunctionalComponent, RenderableProps } from "preact";
import { useContext } from "preact/compat";

import { TranslateContext } from "@denysvuika/preact-translate";
import { RenderContext } from "../../contexts/PageProvider";

import Link, { Props as LinkProps } from "../Link";

const linkToProfile = <P extends LinkProps>(
  LinkComponent: FunctionalComponent<LinkProps>
) => {
  return function LinkToProfile(props: RenderableProps<P>) {
    const { t } = useContext(TranslateContext);
    const { renderProfile } = useContext(RenderContext);

    const onClick = () => {
      renderProfile();
    };

    return (
      <LinkComponent onClick={onClick} {...props}>
        {t("labels.back")}
      </LinkComponent>
    );
  };
};

export default linkToProfile<LinkProps>(Link);
