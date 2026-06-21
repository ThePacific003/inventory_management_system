import { useEffect, useState ,useMemo} from "react";
import ProductTable from "../components/products/ProductTable.jsx";
import ProductModal from "../components/products/ProductModal.jsx";
import DeleteConfirmModal from "../components/products/DeleteConfirmModal.jsx";
import useProductStore from "../store/productStore.jsx";
import useSupplierProduct from "../store/supplierProductStore.jsx"
import SupplierListModal from "../components/supplierProducts/SupplierListModal.jsx"

const ProductsPage = () => {
  const {
    products,
    loading,
    productCount,
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProductStore();
   const { supplierProducts, getAllSupplierProduct } = useSupplierProduct();
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
   const [supplierTarget, setSupplierTarget] = useState(null);

  useEffect(() => {
    getAllProducts();
    getAllSupplierProduct();
  }, [getAllProducts]);

   const { supplierCountMap, cheapestPriceMap } = useMemo(() => {
    const countMap = {};
    const priceMap = {};

    supplierProducts.forEach((sp) => {
      const pid = sp.product_id;
      countMap[pid] = (countMap[pid] ?? 0) + 1;

      const cost = Number(sp.unit_price);
      if (priceMap[pid] == null || cost < priceMap[pid]) {
        priceMap[pid] = cost;
      }
    });

    return { supplierCountMap: countMap, cheapestPriceMap: priceMap };
  }, [supplierProducts]);

  const handleOpenAdd = () => {
    setEditTarget(null);
    setModalMode("add");
  };

  const handleOpenEdit = (product) => {
    setEditTarget(product);
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    if (actionLoading) return;
    setModalMode(null);
    setEditTarget(null);
  };

  const handleOpenDelete = (product) => {
    setDeleteTarget(product);
  };

  const handleCloseDelete = () => {
    if (actionLoading) return;
    setDeleteTarget(null);
  };

  const handleSubmit = async (formData) => {
    setActionLoading(true);
    try {
      let success;
      if (modalMode === "edit") {
        const result = await updateProduct(editTarget.id, formData);
        success = !!result;
      } else {
        success = await createProduct(formData);
      }
      if (success) handleCloseModal();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const success = await deleteProduct(deleteTarget.id);
      if (success) setDeleteTarget(null);
    } finally {
      setActionLoading(false);
    }
  };

   const handleViewSuppliers = (product) => setSupplierTarget(product);
  const handleCloseSuppliers = () => setSupplierTarget(null);
  const handleSupplierDataChange = () => getAllSupplierProduct(); 

  const lowStockCount = products.filter(
    (p) => p.quantity <= p.low_stock_threshold
  ).length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Products
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Manage your inventory products
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          {/* Total Products */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Total Products
            </p>
            <p className="text-2xl font-bold text-white">
              {loading && products.length === 0 ? (
                <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
              ) : (
                productCount
              )}
            </p>
          </div>

          {/* In Stock */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              In Stock
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {loading && products.length === 0 ? (
                <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
              ) : (
                products.filter((p) => p.quantity > p.low_stock_threshold).length
              )}
            </p>
          </div>

          {/* Low Stock */}
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Low Stock
            </p>
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-400" : "text-white"}`}>
              {loading && products.length === 0 ? (
                <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
              ) : (
                lowStockCount
              )}
            </p>
            {lowStockCount > 0 && !loading && (
              <p className="text-xs text-red-400/70 mt-1">needs attention</p>
            )}
          </div>
        </div>

        {/* TABLE WRAPPER (Dashboard-like card) */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <ProductTable
            products={products}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onViewSuppliers={handleViewSuppliers} 
            supplierCountMap={supplierCountMap}
            cheapestPriceMap={cheapestPriceMap} 
          />
        </div>
      </div>

      {/* MODALS (unchanged logic) */}
      {modalMode && (
        <ProductModal
          mode={modalMode}
          product={editTarget}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          loading={actionLoading}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={handleCloseDelete}
          loading={actionLoading}
        />
      )}

       {supplierTarget && (
        <SupplierListModal
          product={supplierTarget}
          onClose={handleCloseSuppliers}
          onDataChange={handleSupplierDataChange}
        />
      )}
    </div>
  );
};

export default ProductsPage;