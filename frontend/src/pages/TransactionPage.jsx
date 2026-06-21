import { useEffect, useState, useCallback } from "react";
import useStockStore from "../store/stockStore.jsx";
import TransactionToolbar from "../components/Transactions/TransactionToolbar.jsx";
import TransactionTable from "../components/Transactions/TransactionTable.jsx";
import TransactionFormModal from "../components/Transactions/TransactionFormModal.jsx";
import TransactionDetailModal from "../components/Transactions/TransactionDetailModal.jsx";
import Pagination from "../components/Transactions/Pagination.jsx";
import { Plus } from "lucide-react";

const DEFAULT_FILTERS = {
  page: 1,
  limit: 10,
  type: "",
  startDate: "",
  endDate: "",
  productId: "",
};

export default function TransactionPage() {
  const {
    transactions,
    pagination,
    loading,
    error,
    fetchAllTransactions,
    resetStockState,
  } = useStockStore();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const loadTransactions = useCallback(
    (overrides = {}) => {
      const merged = { ...filters, ...overrides };
      fetchAllTransactions(merged);
    },
    [filters, fetchAllTransactions]
  );

  useEffect(() => {
    loadTransactions();
    return () => resetStockState();
  }, [loadTransactions, resetStockState]);

  const handleFilterChange = (newFilters) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    fetchAllTransactions(updated);
  };

  const handlePageChange = (page) => {
    const updated = { ...filters, page };
    setFilters(updated);
    fetchAllTransactions(updated);
  };

  const handleTransactionCreated = () => {
    loadTransactions({ page: 1 });
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Transactions
            </h1>
            <p className="text-sm text-white/40 mt-1">
              Track all stock movements — incoming and outgoing inventory.
            </p>
          </div>

          <button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all hover:cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>

        {/* TOOLBAR */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
          <TransactionToolbar
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddClick={() => setShowFormModal(true)}
          />
        </div>

        {/* ERROR */}
        {error && !loading && (
          <div className="bg-[#141414] border border-red-500/20 rounded-2xl p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5">
          <TransactionTable
            transactions={transactions}
            loading={loading}
            onRowClick={(t) => setSelectedTransaction(t)}
          />
        </div>

        {/* PAGINATION (NOW USING YOUR COMPONENT) */}
        {!loading && transactions.length > 0 && (
          <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* MODALS */}
      {showFormModal && (
        <TransactionFormModal
          onClose={() => setShowFormModal(false)}
          onSuccess={handleTransactionCreated}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
}