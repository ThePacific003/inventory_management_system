// import useSupplierStore from "../../store/supplierStore";

const SupplierTableRow = ({ supplier, onEdit, onDelete, onView }) => {
  const productCount = Number(supplier.total_products || 0);
  const orderCount = Number(supplier.total_orders || 0);
  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    
      
  return (
    <tr
      className="hover:bg-indigo-50/3 border-b border-gray-50 transition-colors group cursor-pointer"
      onClick={() => onView(supplier)}
    >
      {/* ID */}
      <td className="px-5 py-4 text-slate-400 font-medium text-sm">
        #{supplier.id}
      </td>

      {/* Name + Email */}
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-white">{supplier.name}</p>
        {supplier.email && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
            {supplier.email}
          </p>
        )}
      </td>

      {/* Phone */}
      <td className="px-5 py-4 text-sm text-slate-300 hidden md:table-cell">
        {supplier.phone}
      </td>

      {/* Address */}
      <td className="px-5 py-4 text-xs text-slate-400 hidden lg:table-cell">
        <p className="truncate max-w-[180px]">{supplier.address}</p>
      </td>

      {/* Products */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            productCount === 0
              ? "bg-slate-100 text-slate-500"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
            />
          </svg>
          {productCount}
        </span>
      </td>

      {/* Orders */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            orderCount === 0
              ? "bg-slate-100 text-slate-500"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          {orderCount}
        </span>
      </td>

      {/* Joined Date */}
      <td className="px-5 py-4 text-xs text-slate-400 hidden sm:table-cell">
        {formatDate(supplier.created_at)}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* View */}
          <button
            onClick={() => onView(supplier)}
            title="View supplier"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span className="hidden sm:inline">View</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(supplier)}
            title="Edit supplier"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(supplier)}
            title="Delete supplier"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SupplierTableRow;