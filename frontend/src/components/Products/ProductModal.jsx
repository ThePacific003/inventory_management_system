import { useState, useEffect, useRef } from "react";
import api from "../../api/axios";
import { toNullIfInvalid, toStringOrNull } from "../../utils/sanitize.js";

// ─── Inline dropdown (no extra file needed) ────────────────────────────────────
const SelectDropdown = ({ label, placeholder, options, value, onChange, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value) || null;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="text-xs uppercase tracking-wider text-white/40 block mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center justify-between
          px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-white
          focus:outline-none focus:ring-2 transition-all
          border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20
          ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-white/20"}
        `}
      >
        <span className={selected ? "text-white" : "text-white/25"}>
          {loading ? "Loading..." : selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {selected && !loading && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="text-white/30 hover:text-white/60 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={`w-4 h-4 text-white/30 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && !loading && (
        <div className="absolute z-[60] mt-1.5 w-full bg-[#1e1e1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-white/30 text-center">
              No options available
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto py-1">
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${opt.value === value
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-white/70 hover:bg-white/5 hover:text-white"
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Fetch helpers ─────────────────────────────────────────────────────────────
const useCategoryOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await api.get("/category");
        if (!cancelled) {
          setOptions(
            res.data.categories.map((c) => ({ value: c.id, label: c.name }))
          );
        }
      } catch (e) {
        console.error("Failed to load categories", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { options, loading };
};

const useSupplierOptions = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await api.get("/supplier");
        if (!cancelled) {
          setOptions(
            res.data.suppliers.map((s) => ({ value: s.id, label: s.name }))
          );
        }
      } catch (e) {
        console.error("Failed to load suppliers", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  return { options, loading };
};

// ─── Initial form state ────────────────────────────────────────────────────────
const getInitialForm = (product, mode) => {
  if (mode === "edit" && product) {
    return {
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      quantity: product.quantity || "",
      low_stock_threshold: product.low_stock_threshold || "",
      // keep existing ids so the dropdown pre-selects correctly
      category_id: product.category_id ?? null,
      supplier_id: product.supplier_id ?? null,
    };
  }

  return {
    name: "",
    description: "",
    price: "",
    quantity: "",
    low_stock_threshold: "",
    category_id: null,
    supplier_id: null,
  };
};

// ─── Main component ────────────────────────────────────────────────────────────
const ProductModal = ({ mode, product, onSubmit, onClose, loading }) => {
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(() => getInitialForm(product, mode));

  const { options: categoryOptions, loading: catLoading } = useCategoryOptions();
  const { options: supplierOptions, loading: supLoading } = useSupplierOptions();

  // ── validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.price || isNaN(form.price) || Number(form.price) < 0) {
      newErrors.price = "Valid price is required";
    }

    if (form.quantity === "" || isNaN(form.quantity) || Number(form.quantity) < 0) {
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

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // used by SelectDropdown — receives the raw id value (number) or null
  const handleSelect = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      category_id: form.category_id ?? null,
      supplier_id: form.supplier_id ?? null,
    });
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 rounded-xl text-sm bg-white/5 border text-white placeholder:text-white/25 focus:outline-none focus:ring-2 transition-all ${
      errors[field]
        ? "border-red-500/50 focus:ring-red-500/20"
        : "border-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20"
    }`;

  // ── render ────────────────────────────────────────────────────────────────────
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
          <div className={`grid gap-4 ${mode === "edit" ? "grid-cols-1" : "grid-cols-2"}`}>
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

          {/* ── CATEGORY DROPDOWN (replaces raw category_id input) ── */}
          <SelectDropdown
            label="Category"
            placeholder="Select a category..."
            options={categoryOptions}
            value={form.category_id}
            onChange={handleSelect("category_id")}
            loading={catLoading}
          />

          {/* ── SUPPLIER DROPDOWN (replaces raw supplier_id input) ── */}
          <SelectDropdown
            label="Supplier"
            placeholder="Select a supplier..."
            options={supplierOptions}
            value={form.supplier_id}
            onChange={handleSelect("supplier_id")}
            loading={supLoading}
          />

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
