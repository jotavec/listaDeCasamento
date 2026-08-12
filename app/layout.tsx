import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Montserrat,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";

const pinyon = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--fontPinyon",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--fontCormorant",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--fontMontserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lista de Casamento",
  description: "Lista de casamento e informações da celebração.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${pinyon.variable} ${cormorant.variable} ${montserrat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
