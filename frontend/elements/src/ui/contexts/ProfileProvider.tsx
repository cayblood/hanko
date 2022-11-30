import * as preact from "preact";
import { ComponentChildren, createContext } from "preact";

import { Emails } from "@teamhanko/hanko-frontend-sdk";

import { AppContext } from "./AppProvider";
import { useContext, useState } from "preact/compat";

interface Props {
  children: ComponentChildren;
}

interface Context {
  profileInitialize: () => Promise<void>;
  emails: Emails;
}

export const ProfileContext = createContext<Context>(null);

const ProfileProvider = ({ children }: Props) => {
  const { hanko } = useContext(AppContext);
  const [emails, setEmails] = useState<Emails>();

  const profileInitialize = async (): Promise<void> => {
    const emails = await hanko.email.list();
    setEmails(emails);
  };

  return (
    <ProfileContext.Provider value={{ profileInitialize, emails }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;
