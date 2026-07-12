"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { House, Image, Library, Video, Shapes, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const NAV_ITEMS = [
  { label: "首页", href: "/", icon: House },
  { label: "图片生成", href: "/image-generation", icon: Image },
  { label: "常用", href: "/common", icon: Library },
  { label: "视频生成", href: "/video-generation", icon: Video },
  { label: "其他", href: "/other", icon: Shapes },
];

export default function FloatingNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("myprompt-main-nav-collapsed") === "true";
    setCollapsed(stored);
    document.documentElement.dataset.navCollapsed = String(stored);
  }, []);
  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("myprompt-main-nav-collapsed", String(next));
    document.documentElement.dataset.navCollapsed = String(next);
  }

  return (
    <aside className="app-sidebar" aria-label="主导航" data-collapsed={collapsed}>
      <Link href="/" className="brand-mark" aria-label="myprompt 首页">
        <span className="brand-icon"><Sparkles size={17} strokeWidth={2} /></span>
        <span className="brand-copy"><strong>myprompt</strong><small>PROMPT STUDIO</small></span>
      </Link>

      <nav className="primary-nav">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="nav-item" data-active={active} title={item.label}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
              {active && <i aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <span className="status-dot" />
        <span>本地工作区</span>
      </div>
      <button className="sidebar-toggle" onClick={toggleCollapsed} title={collapsed ? "展开主导航" : "收起主导航"}>
        {collapsed ? <PanelLeftOpen size={16}/> : <PanelLeftClose size={16}/>}<span>{collapsed ? "展开" : "收起"}</span>
      </button>
    </aside>
  );
}
