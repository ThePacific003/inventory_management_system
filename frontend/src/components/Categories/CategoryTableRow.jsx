const CategoryTableRow = ({ category, onEdit, onDelete, onView }) => {
  const productCount = parseInt(category.total_products || "0", 10);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <tr
      className="hover:bg-indigo-50/3  border-b border-gray-50 transition-colors group cursor-pointer"
      onClick={() => onView(category)}
    >
      {/* # */}
      <td className="px-5 py-4 text-slate-400 font-medium text-sm">#{category.id}</td>

      {/* Name */}  
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-white">{category.name}</p>
        {category.description && (
          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">
            {category.description}
          </p>
        )}
      </td>

      {/* Products badge */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            productCount === 0
              ? "bg-slate-100 text-slate-500"
              : "bg-indigo-100 text-indigo-700"
          }`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
          </svg>
          {productCount}
        </span>
      </td>

      {/* Created date */}
      <td className="px-5 py-4 text-xs text-slate-400 hidden sm:table-cell">
        {formatDate(category.created_at)}
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div
          className="flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(category)}
            title="Edit category"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={() => onDelete(category)}
            title="Delete category"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors hover:cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CategoryTableRow;
