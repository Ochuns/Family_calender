import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "家族カレンダー",
  description: "家族専用カレンダーアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
