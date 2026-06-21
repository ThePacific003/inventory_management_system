import useSupplierStore from "../../store/supplierStore.jsx";

export default function DeleteConfirmModal({ supplier, onClose }) {
  const { deleteSupplier, loading } = useSupplierStore();

  async function handleConfirm() {
    const success = await deleteSupplier(supplier.id);
    if (success) onClose();
  }

  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-6 py-6">

          {/* Icon */}
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 01-1-1V5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H9z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-center text-lg font-bold text-white mb-1">
            Delete Supplier
          </h2>

          <p className="text-center text-sm text-white/50 mb-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{supplier.name}"
            </span>
            ?
          </p>

          {/* Warning (same logic, new UI) */}
          {(Number(supplier.total_products) > 0 || Number(supplier.total_orders) > 0) && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <svg
                className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>

              <div>
                <p className="text-xs font-semibold text-amber-300">
                  Warning
                </p>

                <p className="text-xs text-amber-400/80 mt-1">
                  This supplier has{" "}
                  {Number(supplier.total_products) > 0 && (
                    <span className="font-medium">
                      {supplier.total_products} linked product(s)
                    </span>
                  )}
                  {Number(supplier.total_products) > 0 &&
                    Number(supplier.total_orders) > 0 &&
                    " and "}
                  {Number(supplier.total_orders) > 0 && (
                    <span className="font-medium">
                      {supplier.total_orders} order(s)
                    </span>
                  )}
                  . Deleting may affect related records.
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-white/30 mb-5">
            This action cannot be undone.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:cursor-pointer"
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}