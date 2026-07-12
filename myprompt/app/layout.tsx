import type { Metadata } from "next";
import "./globals.css";
import FloatingNav from "@/components/FloatingNav";

export const metadata: Metadata = {
  title: "myprompt - 提示词管理",
  description: "个人提示词版本管理工作台",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <FloatingNav />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
