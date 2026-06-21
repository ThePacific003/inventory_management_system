import { useState } from "react";
import { toNullIfInvalid,toStringOrNull } from "../../utils/sanitize.js";

const getInitialForm = (product, mode) => {
  if (mode === "edit" && product) {
    return {
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      quantity:product.quantity || "",
      low_stock_threshold: product.low_stock_threshold || "",
    };
  }

  return {
    name: "",
    description: "",
    price: "",
    quantity: "",
    low_stock_threshold: "",
  };
};

const ProductModal = ({ mode, product, onSubmit, onClose, loading }) => {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => getInitialForm(product, mode));

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      newErrors.price = "Valid price is required";
    }

    if (
      form.quantity === "" ||
      isNaN(form.quantity) ||
      Number(form.quantity) < 0
    ) {
      newErrors.quantity = "Valid quantity is required";
    }

    if (
      form.low_stock_threshold === "" ||
      isNaN(form.low_stock_threshold) ||
      Number(form.low_stock_threshold) < 0
    ) {
      newErrors.low_stock_threshold = "Valid threshold is required";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
       name: toStringOrNull(form.name),
    description: toStringOrNull(form.description),
    price: toNullIfInvalid(form.price),
    quantity: toNullIfInvalid(form.quantity),
    low_stock_threshold: toNullIfInvalid(form.low_stock_threshold),
    category_id: toNullIfInvalid(form.category_id),
    supplier_id: toNullIfInvalid(form.supplier_id),
    });
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-white placeholder:text-white/25 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-500/50 focus:ring-red-500/20"
        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#141414] border border-white/10 rounded-2xl shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === "edit" ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {mode === "edit"
                ? "Update product details"
                : "Create a new inventory item"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* NAME */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/40">
              Product Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputClass("name")}
              placeholder="e.g. Linen Shirts"
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/40">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={inputClass("description")}
              placeholder="Short product description"
            />
          </div>

       {/* PRICE + QTY */}
<div
  className={`grid gap-4 ${
    mode === "edit" ? "grid-cols-1" : "grid-cols-2"
  }`}
>
  <div>
    <label className="text-xs uppercase tracking-wider text-white/40">
      Price *
    </label>
    <input
      name="price"
      type="number"
      value={form.price}
      onChange={handleChange}
      className={inputClass("price")}
    />
    {errors.price && (
      <p className="text-xs text-red-400 mt-1">{errors.price}</p>
    )}
  </div>

  {mode !== "edit" && (
    <div>
      <label className="text-xs uppercase tracking-wider text-white/40">
        Quantity *
      </label>
      <input
        name="quantity"
        type="number"
        value={form.quantity}
        onChange={handleChange}
        className={inputClass("quantity")}
      />
      {errors.quantity && (
        <p className="text-xs text-red-400 mt-1">{errors.quantity}</p>
      )}
    </div>
  )}
</div>


           <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="text-xs uppercase tracking-wider text-white/40">
                Category_id*
              </label>
              <input
                name="category_id"
                type="number"
                value={form.category_id}
                onChange={handleChange}
                className={inputClass("category_id")}
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-white/40">
                Supplier_id*
              </label>
              <input
                name="supplier_id"
                type="number"
                value={form.supplier_id}
                onChange={handleChange}
                className={inputClass("supplier_id")}
              />
            </div>
          </div>

          {/* THRESHOLD */}
          <div>
            <label className="text-xs uppercase tracking-wider text-white/40">
              Low Stock Threshold *
            </label>
            <input
              name="low_stock_threshold"
              type="number"
              value={form.low_stock_threshold}
              onChange={handleChange}
              className={inputClass("low_stock_threshold")}
            />
            {errors.low_stock_threshold && (
              <p className="text-xs text-red-400 mt-1">
                {errors.low_stock_threshold}
              </p>
            )}
            <p className="text-xs text-white/30 mt-1">
              Alert when stock falls below this number
            </p>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 transition hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition disabled:opacity-50 hover:cursor-pointer"
            >
              {loading
                ? "Saving..."
                : mode === "edit"
                ? "Save Changes"
                : "Add Product"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductModal;