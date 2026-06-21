import { useEffect, useState, useMemo } from "react";
import { Plus } from "lucide-react";
import useOrderStore from "../store/orderStore.jsx";
import useSupplierStore from "../store/supplierStore.jsx";
import useProductStore from "../store/productStore.jsx";

import OrderTable from "../components/Orders/OrderTable.jsx";
import OrderSearchBar from "../components/Orders/OrderSearchBar.jsx";
// import OrderPagination from "../components/orders/OrderPagination";
import OrderFormModal from "../components/Orders/OrderFormModal.jsx";
import OrderDetailModal from "../components/Orders/OrderDetailModal.jsx";
import CancelOrderModal from "../components/Orders/CancelOrderModal.jsx";

const PAGE_SIZE = 10;

const OrderManagementPage = () => {
  const {
    orders,
    loading,
    createOrder,
    updateOrder,
    updateOrderStatus,
    cancelOrder,
  } = useOrderStore();

  const { suppliers } = useSupplierStore();
  const { products } = useProductStore();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const getAllOrders = useOrderStore((state) => state.getAllOrders);
  const getAllSuppliers = useSupplierStore((state) => state.getAllSuppliers);
  const getAllProducts = useProductStore((state) => state.getAllProducts);

  const [formModal, setFormModal] = useState({
    open: false,
    mode: "add",
    order: null,
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    order: null,
  });

  const [cancelModal, setCancelModal] = useState({
    open: false,
    order: null,
  });

  useEffect(() => {
    getAllOrders();
    getAllSuppliers();
    getAllProducts();
  }, [getAllOrders, getAllSuppliers, getAllProducts]);

  const filteredOrders = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.supplier_name?.toLowerCase().includes(q) ||
        o.user_name?.toLowerCase().includes(q) ||
        o.status?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ───────────── HANDLERS (UNCHANGED LOGIC) ─────────────

  const handleAddOpen = () =>
    setFormModal({ open: true, mode: "add", order: null });

  const handleEditOpen = (order) =>
    setFormModal({ open: true, mode: "edit", order });

  const handleFormClose = () =>
    setFormModal({ open: false, mode: "add", order: null });

  const handleFormSubmit = async (payload) => {
    const success =
      formModal.mode === "add"
        ? await createOrder(payload)
        : await updateOrder(formModal.order.id, payload);

    if (success) handleFormClose();
  };

  const handleViewOpen = (order) =>
    setDetailModal({ open: true, order });

  const handleViewClose = () =>
    setDetailModal({ open: false, order: null });

  const handleCancelOpen = (order) =>
    setCancelModal({ open: true, order });

  const handleCancelClose = () =>
    setCancelModal({ open: false, order: null });

  const handleCancelConfirm = async (id) => {
    await cancelOrder(id);
    handleCancelClose();
  };

  const handleMarkReceived = async (order) => {
    await updateOrderStatus(order.id);
  };

  // ───────────── UI STATS ─────────────
  const totalOrders = orders.length;

  const activeResults = filteredOrders.length;

  const pendingOrders = orders.filter(
    (o) => o.status?.toLowerCase() === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Orders
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Manage orders, status and deliveries
            </p>
          </div>

          <button
            onClick={handleAddOpen}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Order
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-white">
              {totalOrders}
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Search Results
            </p>
            <p className="text-2xl font-bold text-indigo-400">
              {activeResults}
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Pending Orders
            </p>
            <p className="text-2xl font-bold text-amber-400">
              {pendingOrders}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
          <OrderSearchBar value={search} onChange={handleSearchChange} />
        </div>

        {/* TABLE */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <OrderTable
            orders={paginatedOrders}
            loading={loading}
            onView={handleViewOpen}
            onEdit={handleEditOpen}
            onCancel={handleCancelOpen}
            onMarkReceived={handleMarkReceived}
          />
        </div>

        {/* PAGINATION */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/60 text-sm">
            <p>
              Showing{" "}
              <span className="text-white font-medium">
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, filteredOrders.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-medium">
                {filteredOrders.length}
              </span>{" "}
              orders
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#141414] hover:bg-white/5 disabled:opacity-40"
              >
                Previous
              </button>

              <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">
                {currentPage}
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#141414] hover:bg-white/5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      {formModal.open && (
        <OrderFormModal
         key={formModal.mode === "edit" ? formModal.order?.id : "new"}
          mode={formModal.mode}
          order={formModal.order}
          suppliers={suppliers}
          products={products}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          loading={loading}
        />
      )}

      {detailModal.open && (
        <OrderDetailModal
          order={detailModal.order}
          onClose={handleViewClose}
        />
      )}

      {cancelModal.open && (
        <CancelOrderModal
          order={cancelModal.order}
          onConfirm={handleCancelConfirm}
          onClose={handleCancelClose}
          loading={loading}
        />
      )}
    </div>
  );
};

export default OrderManagementPage;