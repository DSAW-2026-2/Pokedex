import { TYPE_ICON_ASSETS } from "../data/typeIcons";

interface TypeIconProps {
  type: string;
  size?: "sm" | "md";
}

export default function TypeIcon({ type, size = "sm" }: TypeIconProps) {
  const icon = TYPE_ICON_ASSETS[type];
  if (!icon) return null;

  return (
    <span className={`type-icon ${size === "md" ? "medium" : ""}`} aria-hidden="true">
      <img src={icon} alt="" />
    </span>
  );
}
