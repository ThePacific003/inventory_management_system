import { ChevronLeft, ChevronRight } from "lucide-react";

const OrderPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  const withEllipsis = visiblePages.reduce((acc, page, idx) => {
    if (idx > 0 && page - visiblePages[idx - 1] > 1) {
      acc.push("...");
    }
    acc.push(page);
    return acc;
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Page <span className="font-medium text-gray-700">{currentPage}</span> of{" "}
        <span className="font-medium text-gray-700">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {withEllipsis.map((item, idx) =>
          item === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-8 h-8 text-sm rounded-md transition font-medium ${
                item === currentPage
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OrderPagination;
