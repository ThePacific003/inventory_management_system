import { useState } from "react";

const getInitialForm = (initialData) => ({
  name: initialData?.name || "",
  description: initialData?.description || "",
});

const CategoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
}) => {
  const [form, setForm] = useState(() => getInitialForm(initialData));
  const [errors, setErrors] = useState({});

  const isEdit = !!initialData;

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "Category name is required.";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      onClick={!loading ? onClose : undefined}
    />

    {/* Modal */}
    <div className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              {isEdit ? "Edit Category" : "New Category"}
            </h2>

            <p className="text-sm text-white/40 mt-1">
              {isEdit
                ? "Update category details"
                : "Add a new category to your inventory"}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/50 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5 disabled:opacity-50 hover:cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Category Name *
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Electronics"
            className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border transition-all text-white placeholder:text-white/30 focus:outline-none focus:ring-2 ${
              errors.name
                ? "border-red-500 focus:ring-red-500/20"
                : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
            }`}
          />

          {errors.name && (
            <p className="text-red-400 text-xs mt-2">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Description (optional)
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            placeholder="Brief description..."
            className="w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all disabled:opacity-50 hover:cursor-pointer"
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Category"
              : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
};

export default CategoryModal;