import Image from "next/image";

type Props = {
  width?: number;
  priority?: boolean;
  tone?: "white" | "black" | "color";
};

export function Monogram({ width = 160, priority = false, tone = "white" }: Props) {
  // Show only the artwork inside the supplied 1181px square, with 4px of padding.
  // The original transparent file remains intact; empty margins are clipped by the layout.
  const frame = { x: 179, y: 384, width: 824, height: 425 };
  return (
    <span
      style={{
        display: "block", position: "relative", overflow: "hidden",
        width, maxWidth: "100%", aspectRatio: `${frame.width} / ${frame.height}`,
        margin: "0 auto", flexShrink: 0,
      }}
    >
      <Image
        src="/monograma-jj-transparente.png"
        alt="Monograma de Jéssica e João Vitor"
        width={1181}
        height={1181}
        sizes={`${Math.ceil(width * 1181 / frame.width)}px`}
        priority={priority}
        style={{
          position: "absolute", display: "block", maxWidth: "none", height: "auto",
          width: `${1181 / frame.width * 100}%`,
          left: `${-frame.x / frame.width * 100}%`,
          top: `${-frame.y / frame.height * 100}%`,
          filter: tone === "color" ? undefined : tone === "white" ? "brightness(0) invert(1)" : "brightness(0)",
        }}
      />
    </span>
  );
}
