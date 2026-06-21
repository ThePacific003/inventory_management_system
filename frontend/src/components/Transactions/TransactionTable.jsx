import TransactionTableRow from "./TransactionTableRow.jsx";
import { ArrowDownUp } from "lucide-react";

const COLUMNS = [
  { label: "ID", className: "w-16" },
  { label: "Product" },
  { label: "Type", className: "w-28" },
  { label: "Quantity", className: "w-28" },
  { label: "Stock After", className: "w-28 text-center" },
  { label: "Performed By",className:"text-center" },
  { label: "Date", className: "w-44" },
];

export default function TransactionTable({
  transactions,
  loading,
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-black/30">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.label}
                    className={`px-4 py-3 text-left text-white text-xs font-semibold uppercase tracking-wider ${
                      col.className || ""
                    }`}
                  > 
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {COLUMNS.map((col) => (
                    <td key={col.label} className="px-4 py-4">
                      <div className="h-4 rounded bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141414] py-20 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-black/30">
          <ArrowDownUp className="h-5 w-5 text-white/20" />
        </div>

        <p className="text-sm font-medium text-white/60">
          No transactions found
        </p>

        <p className="mt-1 text-xs text-white/30">
          Adjust your filters or record a new transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          {/* HEADER */}
          <thead className="bg-black/30">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  className={`px-4 py-3  text-xs font-semibold uppercase tracking-wider text-white ${
                    col.className || ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-white/5">
            {transactions.map((transaction) => (
              <TransactionTableRow
                key={transaction.id}
                transaction={transaction}
                onClick={() => onRowClick(transaction)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}