import { useEffect } from "react";
import {
  X,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  User,
  Calendar,
  FileText,
  Layers,
} from "lucide-react";
import { formatDate } from "../../utils/formatDate";

function DetailRow({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/10 last:border-0">
      <div className="mt-0.5 w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-white/60" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/40">{label}</p>
        <p className={`text-sm font-medium text-white mt-0.5 ${valueClass}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function TransactionDetailModal({ transaction, onClose }) {
  const {
    id,
    type,
    quantity,
    product_name,
    stock_after,
    user_name,
    user_email,
    note,
    created_at,
  } = transaction;

  const isIn = type === "IN";

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      {/* MODAL */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141414] text-white shadow-xl">

        {/* HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-white/10">

          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isIn ? "bg-emerald-500/10" : "bg-rose-500/10"
              }`}
            >
              {isIn ? (
                <ArrowDownToLine className="w-5 h-5 text-emerald-400" />
              ) : (
                <ArrowUpFromLine className="w-5 h-5 text-rose-400" />
              )}
            </div>

            <div>
              <h2 className="text-base font-semibold text-white">
                Transaction #{id}
              </h2>

              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 border ${
                  isIn
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isIn ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                {isIn ? "Stock In" : "Stock Out"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition hover:cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-2">
          <DetailRow icon={Package} label="Product" value={product_name} />

          <DetailRow
            icon={isIn ? ArrowDownToLine : ArrowUpFromLine}
            label="Quantity"
            value={`${isIn ? "+" : "-"}${quantity} units`}
            valueClass={isIn ? "text-emerald-400" : "text-rose-400"}
          />

          <DetailRow
            icon={Layers}
            label="Stock After Transaction"
            value={`${stock_after} units`}
          />

          <DetailRow
            icon={User}
            label="Performed By"
            value={`${user_name} · ${user_email}`}
          />

          <DetailRow
            icon={Calendar}
            label="Date & Time"
            value={formatDate(created_at)}
          />

          {note && (
            <DetailRow icon={FileText} label="Note" value={note} />
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition hover:cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}