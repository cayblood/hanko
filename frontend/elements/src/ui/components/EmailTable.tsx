import * as preact from "preact";
import { useContext, useState } from "preact/compat";

import {
  Email,
  Emails,
  HankoError,
  UserInfo,
  UnauthorizedError,
} from "@teamhanko/hanko-frontend-sdk";

import Table, { Columns } from "./Table";
import Checkmark from "./Checkmark";
import LoadingIndicatorLink from "../components/link/withLoadingIndicator";

import { RenderContext } from "../contexts/PageProvider";
import { UserContext } from "../contexts/UserProvider";
import { Fragment } from "preact";

interface Props {
  emails: Emails;
  setError: (e: HankoError) => void;
}

const EmailTable = ({ emails = [], setError }: Props) => {
  const { user, emailAddress, setEmailAddress } = useContext(UserContext);
  const { renderPasscode, renderReAuth } = useContext(RenderContext);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const verify = (email: Email) => {
    setEmailAddress(email.address);
    setIsLoading(true);

    const userInfo: UserInfo = {
      id: user.id,
      email_id: email.id,
      verified: email.is_verified,
      has_webauthn_credential:
        user.webauthn_credentials && user.webauthn_credentials.length > 0,
    };

    renderPasscode(userInfo, false, true)
      .finally(() => setIsLoading(false))
      .catch((e) => {
        if (e instanceof UnauthorizedError) {
          renderReAuth(user, emails);
        }
        setError(e);
      });
  };

  const columns: Columns<Email> = [
    {
      name: "Address",
      selector: (email) => {
        if (email.is_primary) {
          return (
            <Fragment>
              <b>{email.address}</b> - <i>primary</i>
            </Fragment>
          );
        }
        return email.address;
      },
    },
    {
      name: "Verified",
      selector: (email) =>
        email.is_verified ? (
          <Checkmark />
        ) : (
          <LoadingIndicatorLink
            onClick={() => verify(email)}
            isLoading={isLoading && email.address === emailAddress}
          >
            verify
          </LoadingIndicatorLink>
        ),
    },
  ];
  return <Table columns={columns} data={emails} />;
};

export default EmailTable;
