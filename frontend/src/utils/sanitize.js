export const toNullIfInvalid = (value) => {
  if (value === "" || value === undefined || value === null) return null;

  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return num;
};

export const toStringOrNull = (value) => {
  if (!value || value.trim?.() === "") return null;
  return value;
};