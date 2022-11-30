import * as preact from "preact";
import { h } from "preact";

import styles from "./Table.sass";

type Selector<T> = (row: T, rowIndex?: number) => string | h.JSX.Element;

interface Column<T> {
  name?: string | number;
  selector?: Selector<T>;
}

export interface Columns<T> extends Array<Column<T>> {}

interface Props<T> {
  columns: Columns<T>;
  data: Array<T>;
}

const Table = function <T>({ columns, data }: Props<T>) {
  const renderRow = (row: T, rowIndex: number) => {
    const tableData = columns.map((column, columnIndex) => (
      <td className={styles.td} key={columnIndex}>
        {column.selector(row, rowIndex)}
      </td>
    ));
    return <tr key={rowIndex}>{tableData}</tr>;
  };

  return (
    <div className={styles.tableWrapper}>
      <table
        // @ts-ignore
        part={"table"}
        className={styles.table}
      >
        <thead>
          <tr>
            {columns.map((column, columnIndex) => (
              <th className={styles.th} key={columnIndex}>
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{data.map((row, rowIndex) => renderRow(row, rowIndex))}</tbody>
      </table>
    </div>
  );
};

export default Table;
