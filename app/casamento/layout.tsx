import { WeddingMotion } from "@/components/WeddingMotion";
import "./motion.css";

export default function WeddingLayout({ children }: { children: React.ReactNode }) {
  return <WeddingMotion>{children}</WeddingMotion>;
}
