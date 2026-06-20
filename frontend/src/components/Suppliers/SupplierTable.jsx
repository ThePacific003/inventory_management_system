import SupplierTableRow from "./SupplierTableRow";

const COLUMNS = [
  "Name",
  "Email",
  "Phone",
  "Address",
  "Products",
  "Orders",
  "Joined",
  "Actions",
];

export default function SupplierTable({
  suppliers,
  loading,
  totalCount,
  onEdit,
  onDelete,
  onView,
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
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: COLUMNS.length }).map((__, j) => (
                    <td key={j} className="px-4 py-4">
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

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141414] py-20 text-center">
        <svg
          className="mb-3 h-12 w-12 text-white/20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5M12 12a4 4 0 100-8 4 4 0 000 8z"
          />
        </svg>

        <p className="text-sm font-medium text-white/60">
          No suppliers found
        </p>
        <p className="mt-1 text-xs text-white/30">
          Try adjusting your search or add a new supplier.
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
                  key={col}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white ${
                    col==="Actions" || col==="Phone"  ?"flex justify-center":" "
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* BODY */}
          <tbody className="divide-y divide-white/5">
            {suppliers.map((supplier) => (
              <SupplierTableRow
                key={supplier.id}
                supplier={supplier}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}