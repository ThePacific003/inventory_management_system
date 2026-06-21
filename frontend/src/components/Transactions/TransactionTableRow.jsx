import { formatDate } from "../../utils/formatDate.js";

export default function TransactionTableRow({ transaction, onClick }) {
  const {
    id,
    type,
    quantity,
    product_name,
    stock_after,
    user_name,
    user_email,
    created_at,
  } = transaction;

  const isIn = type === "IN";

  return (
    <tr
      onClick={onClick}
      className="hover:bg-indigo-50/3 cursor-pointer transition-colors group"
    >
      {/* ID */}
      <td className="px-6 py-4 text-xs text-white font-semibold text-center">#{id}</td>

      {/* Product */}
      <td className="px-6 py-4 text-center">
        <span className="font-semibold text-xs text-white transition-colors">
          {product_name}
        </span>
      </td>

      {/* Type Badge */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isIn
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isIn ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          {isIn ? "Stock In" : "Stock Out"}
        </span>
      </td>

      {/* Quantity */}
      <td className="px-6 py-4 text-center">
        <span
          className={`font-semibold ${isIn ? "text-emerald-600" : "text-rose-600"}`}
        >
          {isIn ? "+" : "-"}
          {quantity}
        </span>
      </td>

      {/* Stock After */}
      <td className="px-6 py-4 text-center">
        <span className="text-white font-semibold text-xs">{stock_after}</span>
      </td>

      {/* User */}
      <td className="px-6 py-4 text-center">
        <div className="flex flex-col">
          <span className="text-white text-xs font-semibold">{user_name}</span>
          <span className="text-xs text-gray-400">{user_email}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-white font-semibold  text-xs whitespace-nowrap">
        {formatDate(created_at)}
      </td>
    </tr>
  );
}
