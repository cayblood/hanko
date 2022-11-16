import * as preact from "preact";
import { ComponentChildren, createContext } from "preact";
import { useCallback, useMemo, useState } from "preact/compat";

import { Hanko, Config } from "@teamhanko/hanko-frontend-sdk";
import { Mode } from "../HankoAuth";

interface Props {
  api?: string;
  lang?: string;
  mode: Mode;
  children: ComponentChildren;
}

interface Context {
  config: Config;
  configInitialize: () => Promise<Config>;
  hanko: Hanko;
  mode: Mode;
}

export const AppContext = createContext<Context>(null);

const AppProvider = ({ api, children, mode }: Props) => {
  const [config, setConfig] = useState<Config>(null);

  const hanko = useMemo(() => {
    if (api.length) {
      return new Hanko(api, 13000);
    }
    return null;
  }, [api]);

  const configInitialize = useCallback(() => {
    return new Promise<Config>((resolve, reject) => {
      if (!hanko) {
        return;
      }

      hanko.config
        .get()
        .then((c) => {
          setConfig(c);

          return resolve(c);
        })
        .catch((e) => reject(e));
    });
  }, [hanko]);

  return (
    <AppContext.Provider value={{ config, mode, configInitialize, hanko }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;
