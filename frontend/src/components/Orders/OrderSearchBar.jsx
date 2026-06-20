import { Search, X } from "lucide-react";

const OrderSearchBar = ({ value, onChange }) => {
  return (
    <div className="relative w-full sm:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by supplier, user, status..."
        className="
          w-full
          pl-10
          pr-10
          py-3
          text-sm
          rounded-xl
          bg-[#0f0f0f]
          border
          border-white/10
          text-white
          placeholder:text-white/30
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500/20
          focus:border-indigo-500
          transition
        "
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-white/40
            hover:text-white
            transition
            hover:cursor-pointer
          "
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default OrderSearchBar;