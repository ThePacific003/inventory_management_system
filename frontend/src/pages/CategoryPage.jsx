import { useEffect, useState } from "react";
import useCategoryStore from "../store/categoryStore.jsx";
import CategoryTable from "../components/categories/CategoryTable.jsx";
import CategoryModal from "../components/categories/CategoryModal.jsx";
import DeleteConfirmModal from "../components/categories/DeleteConfirmModal.jsx";
import CategoryDetailModal from "../components/categories/CategoryDetailModal.jsx";

const CategoryPage = () => {
  const {
    categories,
    loading,
    selectedCategory,
    categoryProducts,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
  } = useCategoryStore();

  const [formModal, setFormModal] = useState({ open: false, category: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, category: null });
  const [detailModal, setDetailModal] = useState({ open: false });

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleOpenCreate = () => setFormModal({ open: true, category: null });
  const handleOpenEdit = (category) => setFormModal({ open: true, category });
  const handleCloseForm = () => setFormModal({ open: false, category: null });

  const handleFormSubmit = async (data) => {
    if (formModal.category) {
      const result = await updateCategory(formModal.category.id, data);
      if (result) handleCloseForm();
    } else {
      const result = await createCategory(data);
      if (result) handleCloseForm();
    }
  };

  const handleOpenDelete = (category) =>
    setDeleteModal({ open: true, category });

  const handleCloseDelete = () =>
    setDeleteModal({ open: false, category: null });

  const handleConfirmDelete = async () => {
    const result = await deleteCategory(deleteModal.category.id);
    if (result) handleCloseDelete();
  };

  const handleOpenDetail = async (category) => {
    setDetailModal({ open: true });
    await getCategoryById(category.id);
  };

  const handleCloseDetail = () => setDetailModal({ open: false });

  const safeCategories = Array.isArray(categories) ? categories : [];

  const totalProducts = safeCategories.reduce(
    (sum, c) => sum + parseInt(c.total_products || "0", 10),
    0
  );

  const emptyCategories = safeCategories.filter(
    (c) => parseInt(c.total_products || "0", 10) === 0
  ).length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Categories
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Manage your product categories
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Category
          </button>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Total Categories
            </p>
            <p className="text-2xl font-bold text-white">
              {safeCategories.length}
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Total Products
            </p>
            <p className="text-2xl font-bold text-indigo-400">
              {totalProducts}
            </p>
          </div>

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Empty Categories
            </p>
            <p
              className={`text-2xl font-bold ${
                emptyCategories > 0 ? "text-amber-400" : "text-white"
              }`}
            >
              {emptyCategories}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <CategoryTable
            categories={safeCategories}
            loading={loading}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onView={handleOpenDetail}
          />
        </div>
      </div>

      {/* MODALS (LOGIC UNCHANGED) */}
      <CategoryModal
        key={selectedCategory?._id || "create"}
        isOpen={formModal.open}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={formModal.category}
        loading={loading}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        category={deleteModal.category}
        loading={loading}
      />

      <CategoryDetailModal
        isOpen={detailModal.open}
        onClose={handleCloseDetail}
        category={selectedCategory}
        products={categoryProducts}
        loading={loading}
      />
    </div>
  );
};

export default CategoryPage;