import { useState } from "react";
import useSupplierStore from "../../store/supplierStore.jsx";

export default function SupplierModal({ editingSupplier, onClose }) {
  const { createSupplier, updateSupplier, loading } = useSupplierStore();

  const isEdit = Boolean(editingSupplier);

  const [form, setForm] = useState(() => ({
    name: editingSupplier?.name ?? "",
    email: editingSupplier?.email ?? "",
    phone: editingSupplier?.phone ?? "",
    address: editingSupplier?.address ?? "",
  }));

  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};

    if (!form.name.trim()) errs.name = "Name is required.";

    if (!form.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";

    if (!form.phone.trim()) errs.phone = "Phone is required.";
    else if (!/^\+?[\d\s-]{7,15}$/.test(form.phone))
      errs.phone = "Enter a valid phone number.";

    if (!form.address.trim()) errs.address = "Address is required.";

    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const result = isEdit
      ? await updateSupplier(editingSupplier.id, form)
      : await createSupplier(form);

    if (result) onClose();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#141414] border border-white/10 shadow-2xl">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? "Edit Supplier" : "New Supplier"}
              </h2>

              <p className="text-sm text-white/40 mt-1">
                {isEdit
                  ? "Update supplier details"
                  : "Add a new supplier to your system"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition hover:cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Name *
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Sunrise Distributors"
              className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />

            {errors.name && (
              <p className="text-red-400 text-xs mt-2">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Email *
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. supplier@example.com"
              className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />

            {errors.email && (
              <p className="text-red-400 text-xs mt-2">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Phone *
            </label>

            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 9800000000"
              className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />

            {errors.phone && (
              <p className="text-red-400 text-xs mt-2">{errors.phone}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Address *
            </label>

            <textarea
              name="address"
              rows={3}
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Itahari-09, Sunsari"
              className={`w-full px-4 py-3 rounded-xl text-sm bg-[#0f0f0f] border text-white placeholder:text-white/30 resize-none focus:outline-none focus:ring-2 transition ${
                errors.address
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-white/10 focus:ring-indigo-500/20 focus:border-indigo-500"
              }`}
            />

            {errors.address && (
              <p className="text-red-400 text-xs mt-2">{errors.address}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-[#0f0f0f] text-white/70 hover:bg-white/5 hover:text-white transition disabled:opacity-50 hover:cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition disabled:opacity-50 hover:cursor-pointer"
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Supplier"
                : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}