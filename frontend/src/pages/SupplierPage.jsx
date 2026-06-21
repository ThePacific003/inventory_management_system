import { useEffect, useState } from "react";
import useSupplierStore from "../store/supplierStore.jsx";
import SupplierTable from "../components/suppliers/SupplierTable.jsx";
import SupplierModal from "../components/suppliers/SupplierModal.jsx";
import DeleteConfirmModal from "../components/suppliers/DeleteConfirmModal.jsx";
import SupplierDetailModal from "../components/suppliers/SupplierDetailModal.jsx";

const PAGE_SIZE = 10;

export default function SupplierPage() {
  const { suppliers, loading, getAllSuppliers } = useSupplierStore();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    getAllSuppliers();
  }, [getAllSuppliers]);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const safePage =
    search.trim() !== "" ? 1 : Math.min(currentPage, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  function handleAddClick() {
    setEditingSupplier(null);
    setIsModalOpen(true);
  }

  function handleEditClick(supplier) {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  }

  function handleDeleteClick(supplier) {
    setDeleteTarget(supplier);
  }

  function handleViewClick(supplier) {
    setDetailTarget(supplier);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setEditingSupplier(null);
  }

  // ---------------- STATS ----------------
  const totalSuppliers = suppliers.length;

  const incompleteSuppliers = suppliers.filter((s) => {
    return !s.name || !s.email || !s.phone || !s.address;
  }).length;

  const activeResults = filtered.length;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Suppliers
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Manage suppliers and their contact information
            </p>
          </div>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Supplier
          </button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

          <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-2">
              Total Suppliers
            </p>
            <p className="text-2xl font-bold text-white">
              {totalSuppliers}
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
              Incomplete Profiles
            </p>
            <p
              className={`text-2xl font-bold ${
                incompleteSuppliers > 0 ? "text-amber-400" : "text-white"
              }`}
            >
              {incompleteSuppliers}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
          <div className="relative w-full sm:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/40">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <SupplierTable
            suppliers={paginated}
            loading={loading}
            totalCount={filtered.length}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onView={handleViewClick}
          />
        </div>

        {/* PAGINATION */}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-white/60 text-sm">
            <p>
              Showing{" "}
              <span className="text-white font-medium">
                {(safePage - 1) * PAGE_SIZE + 1}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="text-white font-medium">{filtered.length}</span>{" "}
              suppliers
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#141414] hover:bg-white/5 disabled:opacity-40"
              >
                Previous
              </button>

              <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white">
                {safePage}
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#141414] hover:bg-white/5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
      {isModalOpen && (
        <SupplierModal
          editingSupplier={editingSupplier}
          onClose={handleModalClose}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          supplier={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {detailTarget && (
        <SupplierDetailModal
          supplier={detailTarget}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  );
}