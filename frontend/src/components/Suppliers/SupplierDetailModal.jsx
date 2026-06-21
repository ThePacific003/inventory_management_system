import { useEffect, useState } from "react";
import { format } from "date-fns";
import useSupplierStore from "../../store/supplierStore.jsx";
import useSupplierProduct from "../../store/supplierProductStore.jsx"; // NEW

const STATUS_STYLES = {
  received: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  ordered: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function StatusBadge({ status }) {
  const style =
    STATUS_STYLES[status?.toLowerCase()] ??
    "bg-white/5 text-white/50 border-white/10";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style}`}
    >
      {status ?? "—"}
    </span>
  );
}

export default function SupplierDetailModal({ supplier, onClose }) {
  const {
    getSupplierById,
    selectedSupplier,
    supplierOrders,
    loading: supplierLoading,
  } = useSupplierStore();

  // NEW — separate store for supplier-product relationships
  const {
    supplierProductsBySupplier,
    getProductsBySupplier,
    loading: spLoading,
  } = useSupplierProduct();

  const [activeTab, setActiveTab] = useState("products");

  // Load supplier meta + orders
  useEffect(() => {
    getSupplierById(supplier.id);
  }, [supplier.id, getSupplierById]);

  // Load products for this supplier when Products tab is active
  useEffect(() => {
    if (activeTab === "products") {
      getProductsBySupplier(supplier.id);
    }
  }, [activeTab, supplier.id, getProductsBySupplier]);

  const loading = supplierLoading || spLoading;

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const tabs = [
    {
      key: "products",
      label: "Products",
      count: supplierProductsBySupplier?.length ?? 0,
    },
    {
      key: "orders",
      label: "Orders",
      count: supplierOrders?.length ?? 0,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl max-h-[90vh]">

        {/* Header — unchanged */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              {selectedSupplier?.name ?? supplier.name}
            </h2>
            <p className="mt-1 text-sm text-white/40">
              {selectedSupplier?.email ?? supplier.email} ·{" "}
              {selectedSupplier?.phone ?? supplier.phone}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Meta — unchanged */}
        {selectedSupplier && (
          <div className="grid grid-cols-2 gap-3 border-b border-white/10 px-6 py-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
              <p className="text-xs text-white/40">Address</p>
              <p className="mt-1 truncate text-sm text-white/80">
                {selectedSupplier.address}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 px-3 py-2 text-center">
              <p className="text-xs text-indigo-300">Products</p>
              <p className="mt-1 text-sm font-semibold text-indigo-400">
                {selectedSupplier?.total_products ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-green-500/10 px-3 py-2 text-center">
              <p className="text-xs text-green-300">Orders</p>
              <p className="mt-1 text-sm font-semibold text-green-400">
                {selectedSupplier?.total_orders ?? 0}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
              <p className="text-xs text-white/40">Joined</p>
              <p className="mt-1 text-sm text-white/80">
                {selectedSupplier.created_at
                  ? format(new Date(selectedSupplier.created_at), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </div>
        )}

        {/* Tabs — unchanged */}
        <div className="flex border-b border-white/10 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative mr-6 py-3 text-sm font-medium transition hover:cursor-pointer ${
                activeTab === tab.key
                  ? "text-indigo-400 border-b-2 border-indigo-500"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.key
                    ? "bg-indigo-500/10 text-indigo-400"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-white/5"
                />
              ))}
            </div>
          ) : activeTab === "products" ? (
            // NEW — pass supplierProductsBySupplier instead of supplierProducts
            <ProductsTab products={supplierProductsBySupplier} />
          ) : (
            <OrdersTab orders={supplierOrders} />
          )}
        </div>

        {/* Footer — unchanged */}
        <div className="flex justify-end border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-[#0f0f0f] px-5 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   PRODUCTS TAB
   Field names fixed to match getProductsBySupplier controller:
   sp.unit_price, p.product_name, p.current_stock,
   p.product_base_price, c.category_name
========================= */
function ProductsTab({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 text-4xl">📦</div>
        <p className="text-sm font-medium text-white/60">No products linked</p>
        <p className="mt-1 text-xs text-white/30">
          This supplier has no associated products yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            {["Product", "Category", "Unit Price", "Base Price", "Stock"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-white/5 transition-colors">

              {/* product_name from controller */}
              <td className="px-4 py-3 text-sm font-medium text-white">
                {p.product_name ?? "—"}
              </td>

              {/* category_name from controller */}
              <td className="px-4 py-3 text-sm text-white/60">
                {p.category_name ? (
                  <span className="inline-block px-2 py-0.5 rounded-lg text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {p.category_name}
                  </span>
                ) : "—"}
              </td>

              {/* unit_price — what this supplier charges */}
              <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                {p.unit_price != null
                  ? `Rs. ${Number(p.unit_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "—"}
              </td>

              {/* product_base_price — selling price */}
              <td className="px-4 py-3 text-sm text-white/60">
                {p.product_base_price != null
                  ? `Rs. ${Number(p.product_base_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "—"}
              </td>

              {/* current_stock + low stock warning */}
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-white/70">{p.current_stock ?? "—"}</span>
                  {p.current_stock != null &&
                    p.low_stock_threshold != null &&
                    p.current_stock <= p.low_stock_threshold && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        Low
                      </span>
                    )}
                </div>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================
   ORDERS TAB — completely unchanged
========================= */
function OrdersTab({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 text-4xl">📄</div>
        <p className="text-sm font-medium text-white/60">No orders found</p>
        <p className="mt-1 text-xs text-white/30">
          This supplier has no associated orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            {["Order ID", "Status", "Amount", "By", "Order Date", "Updated"].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-white/40"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-white/5">
              <td className="px-4 py-3 text-sm text-white">#{o.id}</td>
              <td className="px-4 py-3">
                <StatusBadge status={o.status} />
              </td>
              <td className="px-4 py-3 text-sm text-white/70">
                {o.total_amt != null
                  ? `Rs. ${Number(o.total_amt).toLocaleString()}`
                  : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-white/60 capitalize">
                {o.created_by ?? "—"}
              </td>
              <td className="px-4 py-3 text-sm text-white/60">
                {o.order_date
                  ? format(new Date(o.order_date), "MMM d, yyyy")
                  : "—"}
              </td>
              <td className="px-4 py-3 text-sm text-white/60">
                {o.updated_at
                  ? format(new Date(o.updated_at), "MMM d, yyyy")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}