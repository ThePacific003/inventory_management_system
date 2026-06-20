import { Package } from "lucide-react";
import { OrderTableRow } from "./OrderTableRow";

const COLUMNS = [
  "Order",
  "Supplier",
  "Placed By",
  "Date",
  "Total",
  "Status",
  "Actions",
];

const OrderTable = ({
  orders,
  loading,
  onView,
  onEdit,
  onCancel,
  onMarkReceived,
}) => {
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
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white 
                       ${
                      col.trim() === "Actions"
                        ? "text-center"
                        : "text-left"
                    }
                    `
                  }
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

  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#141414] py-20 text-center">
        <Package className="mb-3 h-12 w-12 text-white/20" />

        <p className="text-sm font-medium text-white/60">
          No orders found
        </p>

        <p className="mt-1 text-xs text-white/30">
          Try adjusting your search or create a new order.
        </p>
      </div>
    );
  }

  const rowProps = {
    onView,
    onEdit,
    onCancel,
    onMarkReceived,
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 hidden md:table">
          <thead className="bg-black/30">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white ${
                    col === "Actions"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {orders.map((order) => (
              <OrderTableRow
                key={order.id}
                order={order}
                {...rowProps}
              />
            ))}
          </tbody>
        </table>

        
      </div>
    </div>
  );
};

export default OrderTable;