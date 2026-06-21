import { useState, useMemo } from "react";
import ProductTableRow from "./ProductTableRow.jsx";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const SKELETON_ROWS = 5;

/* ---------------- EMPTY STATE ---------------- */
const EmptyState = ({ hasSearch }) => (
  <tr>
    <td colSpan={7} className="text-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-white/20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
            />
          </svg>
        </div>

        <p className="text-sm font-medium text-white/40">
          {hasSearch ? "No products match your search" : "No products found"}
        </p>

        {hasSearch && (
          <p className="text-xs text-white/25">
            Try a different name or category
          </p>
        )}
      </div>
    </td>
  </tr>
);

/* ---------------- SAFE SKELETON ROW ---------------- */
const SkeletonRow = ({ widths }) => {
  const safeWidths = Array.isArray(widths)
    ? widths
    : Array(7).fill(70);

  return (
    <tr className="border-b border-white/5">
      {safeWidths.map((w, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 bg-white/10 rounded animate-pulse"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
};

/* ---------------- MAIN TABLE ---------------- */
const ProductTable = ({ products = [], loading, onEdit, onDelete ,onViewSuppliers,supplierCountMap,cheapestPriceMap}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return products;

    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category_name?.toLowerCase().includes(q) ||
        p.supplier_name?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handlePageSize = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">

      {/* ---------------- TOOLBAR ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-white/10">

        {/* SEARCH */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, category…"
            className="w-full pl-3 pr-10 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              ✕
            </button>
          )}
        </div>

        {/* INFO */}
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span>
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </span>

          <select
            value={pageSize}
            onChange={handlePageSize}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/70"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">

         <thead>
  <tr className="bg-white/5 border-b border-white/10">
    {["ID", "Product", "Category", "Supplier", "Price", "Stock","Cost/Suppliers", "Actions"].map(
      (h) => (
        <th
          key={h}
          className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider ${
            h === "Actions"
              ? "text-center"
              : " text-left"
          }`}
        >
          {h}
        </th>
      )
    )}
  </tr>
</thead>

          <tbody>
            {loading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                <SkeletonRow
                  key={i}
                  widths={Array.from({ length: 7 }).map(
                    () => 60 + Math.random() * 30
                  )}
                />
              ))
            ) : paginated.length === 0 ? (
              <EmptyState hasSearch={!!search} />
            ) : (
              paginated.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={onEdit}
                  onDelete={onDelete}
                   onViewSuppliers={onViewSuppliers}       // NEW
  supplierCount={supplierCountMap[product.id] ?? 0}   // NEW
  cheapestPrice={cheapestPriceMap[product.id] ?? null} // NEW
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------- PAGINATION ---------------- */}
      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 text-xs text-white/40">

          <span>
            Showing {(safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              Prev
            </button>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              Next
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ProductTable;