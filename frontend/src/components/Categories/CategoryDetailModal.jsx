const CategoryDetailModal = ({
  isOpen,
  onClose,
  category,
  products,
  loading,
}) => {
  if (!isOpen) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(value));

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const totalProducts = parseInt(category?.total_products || "0", 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {category?.name || "Category Details"}
              </h2>

              {category?.description && (
                <p className="text-white/40 text-sm mt-1">
                  {category.description}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <svg
                className="w-5 h-5"
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
          </div>

          {category && (
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>

                {totalProducts} product
                {totalProducts !== 1 ? "s" : ""}
              </span>

              <span className="text-white/40 text-xs">
                Created {formatDate(category.created_at)}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg
                className="w-8 h-8 animate-spin text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>

              <p className="text-sm text-white/50">
                Loading products...
              </p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
                  />
                </svg>
              </div>

              <p className="text-sm font-medium text-white/50">
                No products in this category
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-white mb-3">
                Products in this category
              </h3>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-sm text-white">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Product
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Price
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        Qty
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">
                        Supplier
                      </th>

                      <th className="px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">
                        Updated
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {products.map((product) => {
                      const isLowStock =
                        product.quantity <= product.low_stock_threshold;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-white/[0.03] transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-white">
                            {product.name}
                          </td>

                          <td className="px-4 py-3 text-white/70">
                            {formatCurrency(product.price)}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                isLowStock
                                  ? "bg-red-500/15 text-red-400 border-red-500/20"
                                  : "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {product.quantity}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-white/50 hidden sm:table-cell">
                            {product.supplier_name}
                          </td>

                          <td className="px-4 py-3 text-xs text-white/40 hidden md:table-cell">
                            {formatDate(product.updated_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition-all hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailModal;