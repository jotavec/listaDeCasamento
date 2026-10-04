import Image from "next/image";

export function Monogram({ width = 160, priority = false }: { width?: number; priority?: boolean }) {
  return (
    <Image
      src="/monograma-jj.png"
      alt="Monograma de Jéssica e João Vitor"
      width={667}
      height={325}
      sizes={`${width}px`}
      priority={priority}
      style={{ display: "block", width, maxWidth: "100%", height: "auto", marginInline: "auto" }}
    />
  );
}
