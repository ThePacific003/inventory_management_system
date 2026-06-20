import { useEffect } from "react";
import { X } from "lucide-react";
import useProductStore from "../../store/productStore";

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Stock In", value: "IN" },
  { label: "Stock Out", value: "OUT" },
];

export default function TransactionToolbar({ filters, onFilterChange }) {
  const { products, getAllProducts } = useProductStore();

  useEffect(() => {
    if (!products || products.length === 0) {
      getAllProducts();
    }
  }, [products, getAllProducts]);

  const handleProductChange = (e) => {
    onFilterChange({ productId: e.target.value });
  };

  const handleTypeChange = (e) => {
    onFilterChange({ type: e.target.value });
  };

  const handleStartDateChange = (e) => {
    onFilterChange({ startDate: e.target.value });
  };

  const handleEndDateChange = (e) => {
    onFilterChange({ endDate: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      type: "",
      productId: "",
      startDate: "",
      endDate: "",
    });
  };

  const hasActiveFilters =
    filters.type || filters.productId || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

      {/* LEFT: FILTERS */}
      <div className="flex flex-wrap items-end gap-3">

        {/* TYPE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Type</label>
          <select
            value={filters.type}
            onChange={handleTypeChange}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* PRODUCT */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Product</label>
          <select
            value={filters.productId}
            onChange={handleProductChange}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* START DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={handleStartDateChange}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* END DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-white/40">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={handleEndDateChange}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* CLEAR */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 h-10 px-3 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* RIGHT (reserved for future actions like search/add) */}
      <div />
    </div>
  );
}