"use client";

import { useActionState, useState } from "react";

import {
  importStudentsAction,
  type ImportActionState,
} from "@/app/actions/student-management";
import { Button } from "@/components/ui/button";
import { parseStudentImportCsv } from "@/lib/students/csv";

const initialState: ImportActionState = {
  success: false,
  message: "",
  imported: 0,
  errors: [],
};

export function StudentImportForm() {
  const [csv, setCsv] = useState("");
  const [state, action, pending] = useActionState(
    importStudentsAction,
    initialState,
  );
  const rows = parseStudentImportCsv(csv);
  return (
    <form action={action} className="space-y-4">
      <input name="csv" type="hidden" value={csv} />
      <label className="block space-y-2 text-xs font-semibold">
        <span>Student CSV</span>
        <input
          accept=".csv,text/csv"
          className="border-border block w-full rounded-xl border bg-white p-2 text-sm"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            setCsv(file ? await file.text() : "");
          }}
          type="file"
        />
      </label>
      <a
        className="text-primary text-xs font-semibold underline"
        download="trade-tuter-student-import.csv"
        href={
          "data:text/csv;charset=utf-8," +
          encodeURIComponent(
            "name,email,phone,studentNumber,batchCode,accessStartsAt,accessEndsAt\n",
          )
        }
      >
        Download CSV template
      </a>
      {rows.length ? (
        <div className="border-border max-h-56 overflow-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="bg-silver-100 sticky top-0">
              <tr>
                <th className="p-2">Row</th>
                <th className="p-2">Student</th>
                <th className="p-2">Batch</th>
                <th className="p-2">Preview</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-t" key={row.row}>
                  <td className="p-2">{row.row}</td>
                  <td className="p-2">{row.name || row.email}</td>
                  <td className="p-2">{row.batchCode}</td>
                  <td className="p-2">
                    {row.errors.length ? (
                      <span className="text-red-700">
                        {row.errors.join(", ")}
                      </span>
                    ) : (
                      <span className="text-olive-700">Ready</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {state.message ? (
        <div className="bg-silver-50 rounded-xl p-3 text-sm" role="status">
          <p className="font-semibold">{state.message}</p>
          {state.errors.slice(0, 8).map((error) => (
            <p className="mt-1 text-xs text-red-700" key={error}>
              {error}
            </p>
          ))}
        </div>
      ) : null}
      <Button className="w-full" disabled={pending || !rows.length}>
        {pending
          ? "Importing…"
          : `Import ${rows.filter((row) => !row.errors.length).length} valid rows`}
      </Button>
    </form>
  );
}
