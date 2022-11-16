import * as preact from "preact";
import { useContext, useEffect } from "preact/compat";

import { AppContext } from "../contexts/AppProvider";
import { UserContext } from "../contexts/UserProvider";
import { RenderContext } from "../contexts/PageProvider";

import LoadingIndicator from "../components/LoadingIndicator";

const InitializeReAuth = () => {
  const { config, configInitialize } = useContext(AppContext);
  const { userInitialize } = useContext(UserContext);
  const { renderLoginReAuth, renderError } = useContext(RenderContext);

  useEffect(() => {
    configInitialize().catch((e) => renderError(e));
  }, [configInitialize, renderError]);

  useEffect(() => {
    if (config === null) {
      return;
    }

    userInitialize()
      .then((u) => {
        renderLoginReAuth();

        return;
      })
      .catch((e) => {
        renderError(e);
      });
  }, [config, renderLoginReAuth, renderError, userInitialize]);

  return <LoadingIndicator isLoading />;
};

export default InitializeReAuth;
