import {
  Building2,
} from "lucide-react";

import {  formatDate } from "../../utils/orderUtils";

// ── Status Badge (dark theme aligned) ───────────────────────────────

const StatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    received: "bg-green-500/10 text-green-300 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-300 border-red-500/20",
  };

  const label = status?.charAt(0).toUpperCase() + status?.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
        styles[status] || "bg-white/5 text-white/60 border-white/10"
      }`}
    >
      {label}
    </span>
  );
};

// ── Desktop Row ───────────────────────────────────────────────

export const OrderTableRow = ({
  order,
  onView,
  onEdit,
  onCancel,
  onMarkReceived,
}) => {
  const isPending = order.status === "pending";
  const itemCount =
    order.items?.filter((i) => i.product_id !== null).length ?? 0;

  return (
    <tr
      className="group hover:bg-white/5 transition-colors cursor-pointer"
      onClick={() => onView(order)}
    >
      {/* Order */}
      <td className="px-4 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            #{order.id}
          </p>
          <p className="text-xs text-white/40 mt-0.5">
            {itemCount > 0
              ? `${itemCount} item${itemCount !== 1 ? "s" : ""}`
              : "No items"}
          </p>
        </div>
      </td>

      {/* Supplier */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white/60" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {order.supplier_name}
            </p>
            <p className="text-xs text-white/40 truncate">
              {order.supplier_email}
            </p>
          </div>
        </div>
      </td>

      {/* Placed By */}
      <td className="px-4 py-4 hidden md:table-cell">
        <span className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded-md">
          {order.user_name}
        </span>
      </td>

      {/* Date */}
      <td className="px-4 py-4 hidden lg:table-cell text-xs text-white/40">
        {formatDate(order.order_date)}
      </td>

      {/* Total */}
      <td className="px-4 py-4 text-left">
        <span className="text-sm font-semibold text-white ">
          {/* {formatCurrency(order.total_amt)} */}
          {order.total_amt}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <StatusBadge status={order.status} />
      </td>

    <td className="px-5 py-4">
  <div
    className="flex items-center justify-center gap-1.5"
    onClick={(e) => e.stopPropagation()}
  >
    {/* View */}
    <button
      onClick={() => onView(order)}
      title="View order"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors hover:cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      <span className="hidden sm:inline">View</span>
    </button>

    {/* Edit */}
    {isPending && (
      <button
        onClick={() => onEdit(order)}
        title="Edit order"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors hover:cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span className="hidden sm:inline">Edit</span>
      </button>
    )}

    {/* Mark Received */}
    {isPending && (
      <button
        onClick={() => onMarkReceived(order)}
        title="Mark received"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 transition-colors hover:cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span className="hidden sm:inline">Receive</span>
      </button>
    )}

    {/* Cancel */}
    {isPending && (
      <button
        onClick={() => onCancel(order)}
        title="Cancel order"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors hover:cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span className="hidden sm:inline">Cancel</span>
      </button>
    )}
  </div>
</td>
    </tr>
  );
};