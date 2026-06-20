import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import useStockStore from "../../store/stockStore";
import useProductStore from "../../store/productStore";

const INITIAL_FORM = {
  product_id: "",
  type: "IN",
  quantity: "",
  note: "",
};

export default function TransactionFormModal({ onClose, onSuccess }) {
  const { createTransaction, creating } = useStockStore();
  const { products, getAllProducts } = useProductStore();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!products || products.length === 0) {
      getAllProducts();
    }
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const validate = () => {
    const errs = {};
    if (!form.product_id) errs.product_id = "Select a product.";
    if (!form.type) errs.type = "Select a transaction type.";
    if (!form.quantity || Number(form.quantity) <= 0)
      errs.quantity = "Enter a valid quantity greater than 0.";
    return errs;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      product_id: String(form.product_id),
      type: form.type,
      quantity: Number(form.quantity),
      ...(form.note.trim() ? { note: form.note.trim() } : {}),
    };

    const result = await createTransaction(payload);
    if (result?.success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      {/* MODAL */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141414] text-white shadow-xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white">
              Record Transaction
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Log a stock in or out movement.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-4">

          {/* PRODUCT */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              Product <span className="text-rose-400">*</span>
            </label>

            <select
              value={form.product_id}
              onChange={(e) => handleChange("product_id", e.target.value)}
              className={`w-full h-10 rounded-xl border px-3 text-sm bg-black/30 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.product_id
                  ? "border-rose-500"
                  : "border-white/10"
              }`}
            >
              <option value="">Select a product</option>
              {products.length===0?(
               <option value=""  disabled>
                No products found
               </option>
              ):products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {errors.product_id && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.product_id}
              </p>
            )}
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              Type <span className="text-rose-400">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {["IN", "OUT"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleChange("type", t)}
                  className={`h-10 rounded-xl border text-sm font-medium transition ${
                    form.type === t
                      ? t === "IN"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500 text-rose-400"
                      : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {t === "IN" ? "Stock In" : "Stock Out"}
                </button>
              ))}
            </div>

            {errors.type && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.type}
              </p>
            )}
          </div>

          {/* QUANTITY */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              Quantity <span className="text-rose-400">*</span>
            </label>

            <input
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => handleChange("quantity", e.target.value)}
              placeholder="e.g. 10"
              className={`w-full h-10 rounded-xl border px-3 text-sm bg-black/30 text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                errors.quantity
                  ? "border-rose-500"
                  : "border-white/10"
              }`}
            />

            {errors.quantity && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.quantity}
              </p>
            )}
          </div>

          {/* NOTE */}
          <div>
            <label className="block text-xs font-medium text-white/40 mb-1.5">
              Note{" "}
              <span className="text-white/30 font-normal">(optional)</span>
            </label>

            <textarea
              rows={3}
              value={form.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="e.g. Received from purchase order #12"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 pt-2">

          <button
            onClick={onClose}
            disabled={creating}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={creating}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {creating ? "Saving..." : "Save Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}