// Browser storage is user-controlled and may contain an older or damaged record.
export function lessonRecord<T extends string | boolean>(
  value: unknown,
  total: number,
  type: T extends string ? "string" : "boolean",
): Record<number, T> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([key, entry]) => {
      const id = Number(key);
      return (
        Number.isInteger(id) &&
        String(id) === key &&
        id >= 1 &&
        id <= total &&
        typeof entry === type
      );
    }),
  );
}
