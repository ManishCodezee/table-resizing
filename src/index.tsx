import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import {
  useReactTable,
  ColumnResizeMode,
  getCoreRowModel,
  ColumnDef,
  flexRender,
  ColumnResizeDirection,
} from "@tanstack/react-table";
import { faker } from "@faker-js/faker";
import { calculateTableSizing } from "./calculateTableSizing";
import { useWindowSize } from "usehooks-ts";

type Person = {
  name: string;
  age: number;
  visits: number;
  message: string;
  info: string;
};

const defaultData: Person[] = [
  {
    name: faker.name.fullName(),
    age: faker.number.int(65),
    visits: faker.number.int(500),
    message: faker.company.buzzPhrase(),
    info: faker.lorem.words(10),
  },
  {
    name: faker.name.fullName(),
    age: faker.number.int(65),
    visits: faker.number.int(500),
    message: faker.company.buzzPhrase(),
    info: faker.lorem.words(10),
  },
  {
    name: faker.name.fullName(),
    age: faker.number.int(65),
    visits: faker.number.int(500),
    message: faker.company.buzzPhrase(),
    info: faker.lorem.words(10),
  },
  {
    name: faker.name.fullName(),
    age: faker.number.int(65),
    visits: faker.number.int(500),
    message: faker.company.buzzPhrase(),
    info: faker.lorem.words(10),
  },
  {
    name: faker.name.fullName(),
    age: faker.number.int(65),
    visits: faker.number.int(500),
    message: faker.company.buzzPhrase(),
    info: faker.lorem.words(10),
  },
];

const defaultColumns: ColumnDef<Person>[] = [
  {
    header: "Name",
    accessorKey: "name",
    footer: (props) => props.column.id,
    cell: (info) => info.getValue(),
    meta: {
      isGrow: true,
    },
  },
  {
    header: "Info",
    accessorKey: "info",
    footer: (props) => props.column.id,
    cell: (info) => info.getValue(),
    meta: {
      isGrow: true,
    },
  },
  {
    header: "Age",
    accessorKey: "age",
    footer: (props) => props.column.id,
    cell: (info) => info.getValue(),
    size: 100,
  },
  {
    header: "Message",
    accessorKey: "message",
    footer: (props) => props.column.id,
    minSize: 100,
    cell: (info) => info.getValue(),
    meta: {
      widthPercentage: 20,
    },
  },
];

function App() {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const windowDimensions = useWindowSize();
  const [data] = React.useState(() => [...defaultData]);
  const [columns] = React.useState<typeof defaultColumns>(() => [
    ...defaultColumns,
  ]);

  const [counter, setCounter] = useState(0);

  const [columnResizeMode, setColumnResizeMode] =
    React.useState<ColumnResizeMode>("onChange");
  const [calculateOnWindowResize, setCalculateOnWindowResize] =
    React.useState("off");

  const [columnResizeDirection, setColumnResizeDirection] =
    React.useState<ColumnResizeDirection>("ltr");

  const rerender = () => setCounter((prev) => prev + 1);

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    // Note: You can use Anything here
    defaultColumn: {
      size: 0,
      minSize: 0,
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const headers = table.getFlatHeaders();
  useLayoutEffect(() => {
    if (tableContainerRef.current) {
      const initialColumnSizing = calculateTableSizing(
        headers,
        tableContainerRef.current?.clientWidth
      );
      table.setColumnSizing(initialColumnSizing);
    }

    // Use Dependencies to trigger a reset in column widths
  }, [
    headers,
    calculateOnWindowResize == "on" ? windowDimensions.width : null,
    counter,
  ]);

  return (
    <div className="p-2">
      <select
        value={columnResizeMode}
        onChange={(e) =>
          setColumnResizeMode(e.target.value as ColumnResizeMode)
        }
        className="border p-2 border-black rounded"
      >
        <option value="onEnd">Resize: "onEnd"</option>
        <option value="onChange">Resize: "onChange"</option>
      </select>
      <select
        value={columnResizeDirection}
        onChange={(e) =>
          setColumnResizeDirection(e.target.value as ColumnResizeDirection)
        }
        className="border p-2 border-black rounded"
      >
        <option value="ltr">Resize Direction: "ltr"</option>
        <option value="rtl">Resize Direction: "rtl"</option>
      </select>
      <select
        value={calculateOnWindowResize}
        onChange={(e) =>
          setCalculateOnWindowResize(e.target.value as ColumnResizeDirection)
        }
        className="border p-2 border-black rounded"
      >
        <option value="on">Calculate on window Resize: ON</option>
        <option value="off">Calculate on window Resize: OFF</option>
      </select>
      <div
        ref={tableContainerRef}
        style={{
          direction: table.options.columnResizeDirection,
          width: "100%",
        }}
      >
        <div className="h-4" />
        <div className="text-xl">{"<table/>"}</div>
        <div className="overflow-x-auto">
          <table
            {...{
              style: {
                width: table.getCenterTotalSize(),
              },
            }}
          >
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      {...{
                        key: header.id,
                        colSpan: header.colSpan,
                        style: {
                          width: header.getSize(),
                        },
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      <div
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${
                            table.options.columnResizeDirection
                          } ${
                            header.column.getIsResizing() ? "isResizing" : ""
                          }`,
                          style: {
                            transform:
                              columnResizeMode === "onEnd" &&
                              header.column.getIsResizing()
                                ? `translateX(${
                                    (table.options.columnResizeDirection ===
                                    "rtl"
                                      ? -1
                                      : 1) *
                                    (table.getState().columnSizingInfo
                                      .deltaOffset ?? 0)
                                  }px)`
                                : "",
                          },
                        }}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      {...{
                        key: cell.id,
                        style: {
                          width: cell.column.getSize(),
                        },
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-4" />
      {calculateOnWindowResize == "on" && (
        <h1>Resize The window to trigger the calculation again</h1>
      )}
      <button onClick={rerender} className="border p-2">
        Trigger Calculated Manually
      </button>
      <pre>
        {JSON.stringify(
          {
            columnSizing: table.getState().columnSizing,
            columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
