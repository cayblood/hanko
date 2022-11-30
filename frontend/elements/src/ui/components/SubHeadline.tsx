import * as preact from "preact";
import { ComponentChildren } from "preact";

import styles from "./SubHeadline.sass";

type Props = {
  children: ComponentChildren;
};

const SubHeadline = ({ children }: Props) => {
  return (
    <h2
      // @ts-ignore
      part={"subHeadline"}
      className={styles.subHeadline}
    >
      {children}
    </h2>
  );
};

export default SubHeadline;
