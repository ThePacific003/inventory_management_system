const CheapestSupplierBadge = ({ price }) => {
  if (price == null) {
    return <span className="text-xs text-white/25">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Rs. {Number(price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );
};

export default CheapestSupplierBadge;