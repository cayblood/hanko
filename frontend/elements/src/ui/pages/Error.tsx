import * as preact from "preact";
import {useContext, useEffect} from "preact/compat";

import { HankoError } from "@teamhanko/hanko-frontend-sdk";

import { TranslateContext } from "@denysvuika/preact-translate";
import { RenderContext } from "../contexts/PageProvider";

import ErrorMessage from "../components/ErrorMessage";
import Form from "../components/Form";
import Button from "../components/Button";
import Content from "../components/Content";

interface Props {
  initialError: HankoError;
}

const Error = ({ initialError }: Props) => {
  const { t } = useContext(TranslateContext);
  const { renderInitialize, renderHeadline } = useContext(RenderContext);

  const onContinueClick = (event: Event) => {
    event.preventDefault();
    renderInitialize();
  };

  useEffect(() => renderHeadline(t("headlines.error")), [renderHeadline, t]);

  return (
    <Content>
      <ErrorMessage error={initialError} />
      <Form onSubmit={onContinueClick}>
        <Button>Continue</Button>
      </Form>
    </Content>
  );
};

export default Error;
