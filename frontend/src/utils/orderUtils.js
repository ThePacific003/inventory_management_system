export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(value));
};

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStatusConfig = (status) => {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        classes: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
      };
    case "received":
      return {
        label: "Received",
        classes: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-500",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        classes: "bg-red-100 text-red-700",
        dot: "bg-red-500",
      };
    default:
      return {
        label: status,
        classes: "bg-gray-100 text-gray-600",
        dot: "bg-gray-400",
      };
  }
};
