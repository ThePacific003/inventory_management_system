import { AlertTriangle, X } from "lucide-react";

const CancelOrderModal = ({ order, onConfirm, onClose, loading }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Cancel Order</h2>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to cancel{" "}
          <span className="font-medium text-gray-900">Order #{order.id}</span> from{" "}
          <span className="font-medium text-gray-900">{order.supplier_name}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={() => onConfirm(order.id)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Order"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
