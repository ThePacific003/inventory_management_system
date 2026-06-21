import { useState, useMemo } from "react";
import CategoryTableRow from "./CategoryTableRow.jsx";

const ITEMS_PER_PAGE = 8;

const CategoryTable = ({ categories, loading, onEdit, onDelete, onView }) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        (cat.description || "").toLowerCase().includes(q)
    );
  }, [categories, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = filtered.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">

      {/* TOOLBAR */}
      <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">

        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search categories..."
            className="w-full pl-9 pr-9 py-2.5 text-sm bg-[#0f0f0f] border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
          />

          {search && (
            <button
              onClick={() => {
                setSearch("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {search && (
          <p className="text-xs text-white/40 sm:text-right">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for{" "}
            &quot;{search}&quot;
          </p>
        )}
      </div>

      {/* LOADING */}
      {loading && categories.length === 0 ? (
        <div className="p-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <div className="h-4 bg-white/10 rounded-full w-6" />
              <div className="h-4 bg-white/10 rounded-full flex-1" />
              <div className="h-4 bg-white/10 rounded-full w-1/3 hidden md:block" />
              <div className="h-6 bg-white/10 rounded-full w-12" />
              <div className="h-4 bg-white/10 rounded-full w-24 hidden sm:block" />
              <div className="h-8 bg-white/10 rounded-lg w-20" />
            </div>
          ))}
        </div>
      ) : paginated.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-white/20"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>

          <p className="text-white font-semibold">
            {search ? "No categories found" : "No categories yet"}
          </p>

          <p className="text-white/40 text-sm mt-1">
            {search
              ? `No results for "${search}". Try another search.`
              : "Click Add Category to create your first one."}
          </p>
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white">
           <thead>
  <tr className="border-b border-white/10 ">
    {[
      "ID",
      "Name",
      "Products",
      "Created",
      "Actions",
    ].map((h) => (
      <th
        key={h}
        className={`px-5  py-3 font-semibold text-xs uppercase tracking-wider ${
          h === "Actions"
            ? "text-center"
            : h === "Description"
            ? "hidden md:table-cell text-left"
            : h === "Created"
            ? "hidden sm:table-cell text-left"
            : "text-left"
        }`}
      >
        {h === "Actions" ? "Actions" : h}
      </th>
    ))}
  </tr>
</thead>

            <tbody className="divide-y divide-white/5">
              {paginated.map((cat, idx) => (
                <CategoryTableRow
                  key={cat.id}
                  category={cat}
                  index={(safePage - 1) * ITEMS_PER_PAGE + idx + 1}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION */}
      {filtered.length > ITEMS_PER_PAGE && (
        <div className="px-5 py-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-white/40">
            Showing{" "}
            <span className="text-white font-semibold">
              {(safePage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            of{" "}
            <span className="text-white font-semibold">
              {filtered.length}
            </span>
          </p>

          <div className="flex items-center gap-1.5">

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-40"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= safePage - 1 && page <= safePage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition ${
                        page === safePage
                          ? "bg-indigo-600 text-white"
                          : "border border-white/10 text-white/60 hover:bg-white/5"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }

                if (page === safePage - 2 || page === safePage + 2) {
                  return (
                    <span
                      key={page}
                      className="w-8 h-8 flex items-center justify-center text-white/40"
                    >
                      …
                    </span>
                  );
                }

                return null;
              }
            )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/60 hover:bg-white/5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;