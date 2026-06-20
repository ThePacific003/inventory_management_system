import CheapestSupplierBadge from "../supplierProducts/CheapestSupplierBadge";
import SupplierCountBadge from "../supplierProducts/SupplierCountBadge";

const StockBadge = ({ quantity, threshold }) => {
  const isLow = quantity <= threshold;
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white">{quantity}</span>
      {isLow && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Low
        </span>
      )}
    </div>
  );
};

const ProductTableRow = ({
  product,
  onEdit,
  onDelete,
  onViewSuppliers,   
  supplierCount,     // NEW
  cheapestPrice,     // NEW
}) => {
  return (
    <tr className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">

      {/* ID — unchanged */}
      <td className="px-4 py-3.5 text-sm text-white font-mono">
        #{product.id}
      </td>

      {/* Name + Description — unchanged */}
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-white">{product.name}</p>
        {product.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
            {product.description}
          </p>
        )}
      </td>

      {/* Category — unchanged */}
      <td className="px-4 py-3.5">
        {product.category_name ? (
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
            {product.category_name}
          </span>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* Supplier name — unchanged */}
      <td className="px-4 py-3.5 text-sm text-white">
        {product.supplier_name ?? <span className="text-xs text-white">—</span>}
      </td>

      {/* Price — unchanged */}
      <td className="px-4 py-3.5 text-sm font-semibold text-white">
        NRs. {Number(product.price).toLocaleString("en-NP", { minimumFractionDigits: 2 })}
      </td>

      {/* Stock — unchanged */}
      <td className="px-4 py-3.5">
        <StockBadge quantity={product.quantity} threshold={product.low_stock_threshold} />
      </td>

      {/* ── NEW: Cost / Suppliers column ── */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          <CheapestSupplierBadge price={cheapestPrice} />
          <SupplierCountBadge count={supplierCount} />
        </div>
      </td>

      {/* Actions — edit + delete unchanged, suppliers button added */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-center gap-1.5">

          {/* Suppliers — NEW */}
          <button
            onClick={() => onViewSuppliers(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors hover:cursor-pointer"
            title="View suppliers"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Suppliers</span>
          </button>

          {/* Edit — unchanged */}
          <button
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors hover:cursor-pointer"
            title="Edit product"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete — unchanged */}
          <button
            onClick={() => onDelete(product)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors hover:cursor-pointer"
            title="Delete product"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>

        </div>
      </td>
    </tr>
  );
};

export default ProductTableRow;