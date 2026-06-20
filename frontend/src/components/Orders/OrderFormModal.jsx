import { useState, useEffect } from "react";
import {  Plus, Trash2 } from "lucide-react";
import useSupplierProduct from "../../store/supplierProductStore"; // adjust path as needed

const EMPTY_ITEM = { product_id: "", quantity: 1 };

const OrderFormModal = ({
  mode,
  order,
  suppliers,
  onSubmit,
  onClose,
  loading,
}) => {
  const [supplierId, setSupplierId] = useState(() =>
    mode === "edit" && order ? String(order.supplier_id) : ""
  );

  const [items, setItems] = useState(() => {
    if (mode !== "edit" || !order) {
      return [{ ...EMPTY_ITEM }];
    }
    const existingItems =
      order.items
        ?.filter((i) => i.product_id !== null)
        .map((i) => ({
          product_id: String(i.product_id),
          quantity: i.quantity,
        })) ?? [];
    return existingItems.length > 0
      ? existingItems
      : [{ ...EMPTY_ITEM }];
  });

  const [errors, setErrors] = useState({});
  const isSupplierSelected = Boolean(supplierId);

  // --- Supplier products fetching ---
  const {
    supplierProductsBySupplier=[],
    getProductsBySupplier,
    loading: spLoading,
  } = useSupplierProduct();

  useEffect(() => {
    if (supplierId) {
      getProductsBySupplier(supplierId);
    }
  }, [supplierId]);

  // Map API response into a simpler shape for rendering
  const filteredProducts = supplierId
    ? supplierProductsBySupplier.map((sp) => ({
        id: sp.product_id,
        name: sp.product_name,
        price: sp.unit_price,
        current_stock: sp.current_stock,
      }))
    : [];

  // Rest of your component remains exactly the same...
  const validate = () => {
    const newErrors = {};
    if (!supplierId) newErrors.supplierId = "Supplier is required.";
    items.forEach((item, idx) => {
      if (!item.product_id)
        newErrors[`product_${idx}`] = "Select a product.";
      if (!item.quantity || Number(item.quantity) < 1)
        newErrors[`quantity_${idx}`] = "Qty must be ≥ 1.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const handleRemoveItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
    // Clear per-field error on change
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${field === "product_id" ? "product" : "quantity"}_${idx}`];
      return next;
    });
  };

  const handleSupplierChange = (val) => {
    setSupplierId(val);
    setItems([{ ...EMPTY_ITEM }]);
    setErrors((prev) => {
      const n = { ...prev };
      delete n.supplierId;
      return n;
    });
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      supplier_id: Number(supplierId),
      items: items.map((i) => ({
        product_id: Number(i.product_id),
        quantity: Number(i.quantity),
      })),
    };
    onSubmit(payload);
  };

  // Prevent duplicate product selection within the same form
  const selectedProductIds = items.map((i) => i.product_id).filter(Boolean);

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
              {mode === "add"
                ? "New Order"
                : `Edit Order #${order?.id}`}
            </h2>

            <p className="text-sm text-white/40 mt-1">
              {mode === "add"
                ? "Create a new supplier order"
                : "Update order details"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition hover:cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-6 space-y-5">
        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Supplier *
          </label>

          <select
            value={supplierId}
            onChange={(e) => handleSupplierChange(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border text-white focus:outline-none focus:ring-2 transition ${
              errors.supplierId
                ? "border-red-500 focus:ring-red-500/20"
                : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
            }`}
          >
            <option value="">Select a supplier</option>

            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {errors.supplierId && (
            <p className="text-red-400 text-xs mt-2">
              {errors.supplierId}
            </p>
          )}
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white">
              Items *
            </label>

            <button
              onClick={handleAddItem}
              disabled={!isSupplierSelected}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition disabled:opacity-40 hover:cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          {isSupplierSelected && spLoading && (
            <p className="text-xs text-white/40 mb-2">
              Loading products...
            </p>
          )}

          {isSupplierSelected &&
            !spLoading &&
            filteredProducts.length === 0 && (
              <p className="text-xs text-white/40 mb-2">
                No products found for this supplier.
              </p>
            )}

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex gap-3 items-start bg-[#0f0f0f] p-4 rounded-xl border border-white/10"
              >
                {/* Product */}
                <div className="flex-1">
                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      handleItemChange(
                        idx,
                        "product_id",
                        e.target.value
                      )
                    }
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-[#141414] border text-white focus:outline-none focus:ring-2 transition ${
                      errors[`product_${idx}`]
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                  >
                    <option value="">Select product</option>

                    {filteredProducts.map((p) => {
                      const isSelectedElsewhere =
                        selectedProductIds.includes(
                          String(p.id)
                        ) &&
                        String(p.id) !== item.product_id;

                      return (
                        <option
                          key={p.id}
                          value={p.id}
                          disabled={isSelectedElsewhere}
                        >
                          {p.name} — Rs{" "}
                          {Number(p.price).toLocaleString()}
                        </option>
                      );
                    })}
                  </select>

                  {errors[`product_${idx}`] && (
                    <p className="text-red-400 text-xs mt-2">
                      {errors[`product_${idx}`]}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="w-28">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(
                        idx,
                        "quantity",
                        e.target.value
                      )
                    }
                    placeholder="Qty"
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-[#141414] border text-white focus:outline-none focus:ring-2 transition ${
                      errors[`quantity_${idx}`]
                        ? "border-red-500 focus:ring-red-500/20"
                        : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
                    }`}
                  />

                  {errors[`quantity_${idx}`] && (
                    <p className="text-red-400 text-xs mt-2">
                      {errors[`quantity_${idx}`]}
                    </p>
                  )}
                </div>

                {/* Delete */}
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="mt-3 text-white/40 hover:text-red-400 transition hover:cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 px-6 py-5 border-t border-white/10 sticky bottom-0 bg-[#141414]">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition disabled:opacity-50 hover:cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {mode === "add"
                ? "Creating..."
                : "Saving..."}
            </>
          ) : mode === "add" ? (
            "Create Order"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  </div>
);
};

export default OrderFormModal;