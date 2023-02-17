import { useEffect, Suspense } from "react";
import { registerHankoAuth } from "~/lib/hanko.client";
import { Hanko } from "@teamhanko/hanko-frontend-sdk";
import styles from "~/styles/todo.css";
import type { ActionArgs, LinksFunction } from "@remix-run/node";
import {json, redirect} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader = async () => {
  return json({
    ENV: {
      HANKO_URL: process.env.REMIX_APP_HANKO_API
    },
  });
}

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  console.log(Object.fromEntries(formData.entries()));
  return redirect("/todo");
};

export default function Index() {
  const fetcher = useFetcher();
  const data = useLoaderData();

  useEffect(() => {
    const makeAuthHandler = (hankoUrl: string) => async () => {
      const hanko = new Hanko(hankoUrl);
      const user = await hanko.user.getCurrent();
      // @ts-ignore
      const data = { hankoId: user.id, email: user.email };
      fetcher.submit(data, { method: "post" });
    }

    const handler = makeAuthHandler(data.ENV.HANKO_URL);
    registerHankoAuth({ shadow: true }).then();
    document.addEventListener("hankoAuthSuccess", handler);
    return () => document.removeEventListener("hankoAuthSuccess", handler);
  }, [data.ENV.HANKO_URL, fetcher]);

  return (
    <div className="content">
      <Suspense fallback={"Loading..."}>
        <hanko-auth lang="en" api={data.ENV.HANKO_URL} />
      </Suspense>
    </div>
  );
}
