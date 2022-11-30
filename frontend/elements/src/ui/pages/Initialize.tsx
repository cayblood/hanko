import * as preact from "preact";
import { useCallback, useContext, useEffect } from "preact/compat";

import { UnauthorizedError } from "@teamhanko/hanko-frontend-sdk";

import { AppContext } from "../contexts/AppProvider";
import { UserContext } from "../contexts/UserProvider";
import { RenderContext } from "../contexts/PageProvider";

import LoadingIndicator from "../components/LoadingIndicator";

const Initialize = () => {
  const { config, configInitialize, componentName } = useContext(AppContext);
  const { userInitialize } = useContext(UserContext);
  const {
    eventuallyRenderEnrollment,
    renderLoginEmail,
    renderProfile,
    renderLoginFinished,
    renderError,
  } = useContext(RenderContext);

  const initializeAuth = useCallback(() => {
    userInitialize()
      .then((u) => eventuallyRenderEnrollment(u, false))
      .then((rendered) => {
        if (!rendered) {
          renderLoginFinished();
        }

        return;
      })
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          renderLoginEmail();
        } else {
          renderError(e);
        }
      });
  }, [
    eventuallyRenderEnrollment,
    renderError,
    renderLoginEmail,
    renderLoginFinished,
    userInitialize,
  ]);

  // const initializeReAuth = useCallback(() => {
  //   userInitialize()
  //     .then((u) => {
  //       renderReAuth(u);
  //       return;
  //     })
  //     .catch((e) => {
  //       renderError(e);
  //     });
  // }, [renderError, renderReAuth, userInitialize]);

  const initializeProfile = useCallback(() => {
    Promise.all([userInitialize(), renderProfile()]).catch((e) => {
      renderError(e);
    });
  }, [renderError, renderProfile, userInitialize]);

  useEffect(() => {
    configInitialize().catch((e) => renderError(e));
  }, [configInitialize, renderError]);

  useEffect(() => {
    if (config === null) {
      return;
    }

    switch (componentName) {
      case "auth":
        initializeAuth();
        break;
      // case "re-auth":
      //   initializeReAuth();
      //   break;
      case "profile":
        initializeProfile();
    }
  }, [componentName, config, initializeAuth, initializeProfile]);

  return <LoadingIndicator isLoading />;
};

export default Initialize;
