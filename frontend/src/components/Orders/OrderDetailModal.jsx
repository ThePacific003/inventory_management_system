import { Package, User, Building2, Calendar } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusConfig,
} from "../../utils/orderUtils";

const OrderDetailModal = ({ order, onClose }) => {
  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);
  const hasItems = order.items?.some(
    (item) => item.product_id !== null
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#141414] border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 sticky top-0 bg-[#141414] z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Order #{order.id}
              </h2>
              <p className="text-sm text-white/40 mt-1">
                {formatDate(order.order_date)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.classes}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`}
                />
                {statusConfig.label}
              </span>

              <button
                onClick={onClose}
                className="p-1 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition hover:cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">

          {/* Meta Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Supplier */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 flex gap-3">
              <Building2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/40 mb-1">Supplier</p>
                <p className="text-sm font-medium text-white">
                  {order.supplier_name}
                </p>
                <p className="text-xs text-white/40">
                  {order.supplier_email}
                </p>
              </div>
            </div>

            {/* User */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 flex gap-3">
              <User className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/40 mb-1">Placed by</p>
                <p className="text-sm font-medium text-white">
                  {order.user_name}
                </p>
              </div>
            </div>

            {/* Updated */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 flex gap-3">
              <Calendar className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-white/40 mb-1">Last updated</p>
                <p className="text-sm font-medium text-white">
                  {formatDate(order.updated_at)}
                </p>
              </div>
            </div>

            {/* Total */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
              <Package className="w-4 h-4 text-indigo-300 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-indigo-300 mb-1">
                  Total Amount
                </p>
                <p className="text-sm font-semibold text-indigo-200">
                  {formatCurrency(order.total_amt)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">
              Order Items
            </h3>

            {hasItems ? (
              <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0f0f0f]">

                {/* Table Head */}
                <table className="w-full text-sm">
                  <thead className="bg-[#141414] text-xs text-white/40 uppercase tracking-wide border-b border-white/10">
                    <tr>
                      <th className="text-left px-4 py-3">Product</th>
                      <th className="text-right px-4 py-3">Qty</th>
                      <th className="text-right px-4 py-3">
                        Unit Price
                      </th>
                      <th className="text-right px-4 py-3">
                        Subtotal
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-white/10">
                    {order.items.map((item, idx) => (
                      <tr
                        key={item.item_id ?? idx}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 font-medium text-white">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-right text-white/70">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-white/70">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-white">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border border-white/10 rounded-xl py-8 text-center bg-[#0f0f0f]">
                <Package className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">
                  No item details available.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;