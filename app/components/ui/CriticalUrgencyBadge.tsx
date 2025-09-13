export default function CriticalUrgencyBadge({
  count,
  variant: badgeVariant,
}: {
  count: number;
  variant: "desktop" | "mobile";
}) {
  if (count === 0) return null;

  const baseClasses =
    "inline-flex items-center justify-center rounded-full font-bold text-xs";
  const sizeClasses =
    badgeVariant === "mobile"
      ? "min-w-[20px] h-5 px-1.5"
      : "min-w-[18px] h-4 px-1";
  const colorClasses = "bg-red-600 text-white";

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ml-2`}>
      {count > 99 ? "99+" : count}
    </span>
  );
}
