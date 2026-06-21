import { useEffect, useState } from "react";
import useSupplierProduct from "../../store/supplierProductStore.jsx";
import CheapestSupplierBadge from "./CheapestSupplierBadge.jsx";
import SupplierProductModal from "./SupplierProductModal.jsx";

const SupplierListModal = ({ product, onClose, onDataChange }) => {
  const {
    suppliersByProduct,
    cheapestSupplier,
    loading,
    getSupplierByProducts,
    getCheapestSupplierForProduct,
    deleteSupplierProduct,
  } = useSupplierProduct();

  const [showAssign, setShowAssign] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = () => {
    getSupplierByProducts(product.id);
    getCheapestSupplierForProduct(product.id);
  };

  useEffect(() => {
    loadData();
  }, [product.id]);

  const handleDelete = async (supplierId) => {
    setDeletingId(supplierId);
    const success = await deleteSupplierProduct(supplierId, product.id);
    if (success) {
      loadData();
      onDataChange?.();
    }
    setDeletingId(null);
  };

  const handleAssignSuccess = () => {
    loadData();
    onDataChange?.();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-full max-w-lg max-h-[85vh] flex flex-col bg-[#141414] border border-white/10 rounded-2xl shadow-2xl">

          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
            <div>
              <h2 className="text-lg font-bold text-white">Suppliers</h2>
              <p className="text-xs text-white/40 mt-1">
                <span className="text-indigo-400 font-medium">{product.name}</span>
                {" · "}
                {suppliersByProduct.length} {suppliersByProduct.length === 1 ? "supplier" : "suppliers"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAssign(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Supplier
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* CHEAPEST BANNER */}
          {cheapestSupplier && (
            <div className="mx-6 mt-4 shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Cheapest Supplier</p>
                <p className="text-sm text-white font-medium mt-0.5">
                  {cheapestSupplier.supplier_name ?? cheapestSupplier.name}
                  <span className="text-white/40 font-normal"> · </span>
                  <CheapestSupplierBadge price={cheapestSupplier.unit_price} />
                </p>
              </div>
            </div>
          )}

          {/* SUPPLIER LIST */}
          <div className="overflow-y-auto flex-1 px-6 py-4 space-y-2">
            {loading && suppliersByProduct.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))
            ) : suppliersByProduct.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-white/30">No suppliers assigned yet</p>
                <button
                  onClick={() => setShowAssign(true)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                >
                  Assign the first supplier
                </button>
              </div>
            ) : (
              suppliersByProduct.map((s) => {
                const isCheapest = cheapestSupplier?.supplier_id === s.supplier_id;
                const isDeleting = deletingId === s.supplier_id;

                return (
                  <div
                    key={s.supplier_id}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${
                      isCheapest
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-white/3 border-white/8 hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCheapest ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/40"
                      }`}>
                        {(s.supplier_name ?? s.name ?? "?")[0].toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">
                            {s.supplier_name ?? s.name}
                          </p>
                          {isCheapest && (
                            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                              Best Price
                            </span>
                          )}
                        </div>
                        <CheapestSupplierBadge price={s.unit_price} />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleDelete(s.supplier_id)}
                      disabled={isDeleting}
                      className="shrink-0 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition disabled:opacity-40"
                    >
                      {isDeleting ? "…" : "Remove"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 border-t border-white/10 shrink-0">
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* NESTED ASSIGN MODAL */}
      {showAssign && (
        <SupplierProductModal
          product={product}
          onClose={() => setShowAssign(false)}
          onSuccess={handleAssignSuccess}
        />
      )}
    </>
  );
};

export default SupplierListModal;