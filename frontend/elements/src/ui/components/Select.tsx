import * as preact from "preact";

import styles from "./Select.sass";
import { useEffect, useState } from "preact/compat";

type Selector<T> = (option: T, optionIndex?: number) => string;

type SelectCallback<T> = (item: T) => void;

interface Props<T> {
  hint?: string;
  data: Array<T>;
  valueSelector: Selector<T>;
  textSelector: Selector<T>;
  onSelect: SelectCallback<T>;
  label: string;
  value?: string;
}

const Select = function <T>({
  data,
  hint,
  valueSelector,
  textSelector,
  onSelect,
  label,
  value = "",
}: Props<T>) {
  const [dataValue, setDataValue] = useState<string>("");
  const _onSelect = (event: Event) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLSelectElement)) return;
    const optionValue = event.target.value;
    data.forEach((item, index) => {
      if (optionValue === valueSelector(item, index)) {
        onSelect(item);
      }
    });
  };

  useEffect(() => {
    setDataValue(value);
  }, [value]);
  return (
    <div
      // @ts-ignore
      part={"selectWrapper"}
      className={styles.selectWrapper}
    >
      <select onChange={_onSelect} value={dataValue}>
        {hint && (
          <option value={""} disabled selected>
            {hint}
          </option>
        )}
        {data.map((item, index) => (
          <option key={index} value={valueSelector(item, index)}>
            {textSelector(item, index)}
          </option>
        ))}
      </select>
      <label
        // @ts-ignore
        part={"label"}
        className={styles.label2}
      >
        {label}
      </label>
    </div>
  );
};

export default Select;
