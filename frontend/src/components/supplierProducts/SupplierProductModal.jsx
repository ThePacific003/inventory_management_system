import { useState, useEffect } from "react";
import useSupplierStore from "../../store/supplierStore";
import useSupplierProduct from "../../store/supplierProductStore";

const SupplierProductModal = ({ product, onClose, onSuccess }) => {
  const { suppliers, getAllSuppliers, loading: suppliersLoading } = useSupplierStore();
  const { createSupplierProduct, loading } = useSupplierProduct();

  const [form, setForm] = useState({ supplier_id: "", cost_price: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getAllSuppliers();
  }, [getAllSuppliers]);

  const validate = () => {
    const e = {};
    if (!form.supplier_id) e.supplier_id = "Select a supplier";
    if (!form.cost_price || isNaN(form.cost_price) || Number(form.cost_price) < 0)
      e.cost_price = "Valid cost price required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const result = await createSupplierProduct({
      supplier_id: Number(form.supplier_id),
      product_id: product.id,
      unit_price: Number(form.cost_price),
    });

    if (result?.supplierProduct) {
      onSuccess?.();
      onClose();
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-white placeholder:text-white/25 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-500/50 focus:ring-red-500/20"
        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
    }`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Assign Supplier</h2>
            <p className="text-xs text-white/40 mt-1">
              Adding supplier to{" "}
              <span className="text-indigo-400 font-medium">{product.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* SUPPLIER SELECT */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/40 block mb-1.5">
              Supplier *
            </label>
            {suppliersLoading ? (
              <div className="w-full h-10 bg-white/5 rounded-xl animate-pulse" />
            ) : (
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                className={inputClass("supplier_id")}
              >
                <option value="" className="bg-[#141414]">Select a supplier…</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#141414]">
                    {s.name}
                  </option>
                ))}
              </select>
            )}
            {errors.supplier_id && (
              <p className="text-xs text-red-400 mt-1">{errors.supplier_id}</p>
            )}
          </div>

          {/* COST PRICE */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/40 block mb-1.5">
              Cost Price (Rs.) *
            </label>
            <input
              name="cost_price"
              type="number"
              value={form.cost_price}
              onChange={handleChange}
              placeholder="0.00"
              className={inputClass("cost_price")}
            />
            {errors.cost_price && (
              <p className="text-xs text-red-400 mt-1">{errors.cost_price}</p>
            )}
            <p className="text-xs text-white/30 mt-1">
              Price this supplier charges you for this product
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50"
            >
              {loading ? "Assigning…" : "Assign Supplier"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SupplierProductModal;