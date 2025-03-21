type IconProps = {
  code: string; // Unicode character for the icon
  className?: string; // Optional additional styles
  size?: number; // Optional size in pixels
};

export default function Icon({ code="\uF446", className, size = 24 }: IconProps) {
  return (
    <span
      className={`icon ${className ?? ""}`}
      style={{ userSelect: "none", fontSize: size, lineHeight: "1em" }}
    >
      {code}
    </span>
  );
}