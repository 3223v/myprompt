"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FileText, Image, Images, PanelLeftClose, PanelLeftOpen } from "lucide-react";

const NAV_ITEMS = [
  { label: "文生图", detail: "Text to image", href: "/image-generation/text-to-image", icon: FileText },
  { label: "单图生图", detail: "Image to image", href: "/image-generation/single-image", icon: Image },
  { label: "多图生图", detail: "Image compose", href: "/image-generation/multi-image", icon: Images },
];

export default function ImageSidebar() {
  const pathname = usePathname();
  const [collapsed,setCollapsed]=useState(false);
  useEffect(()=>{const stored=localStorage.getItem("myprompt-image-nav-collapsed")==="true";setCollapsed(stored);document.documentElement.dataset.imageNavCollapsed=String(stored);},[]);
  function toggle(){const next=!collapsed;setCollapsed(next);localStorage.setItem("myprompt-image-nav-collapsed",String(next));document.documentElement.dataset.imageNavCollapsed=String(next);}
  return (
    <aside className={`absolute left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-[#fafaf8] px-3 py-5 transition-[width] max-[760px]:hidden ${collapsed?"w-[58px]":"w-[176px] max-[920px]:w-[58px]"}`}>
      <div className="mb-5 flex h-9 items-center justify-between"><div className={`px-2 ${collapsed?"hidden":"max-[920px]:hidden"}`}><span className="text-[9px] font-semibold uppercase text-subtle">Image studio</span><h2 className="mt-1 text-sm font-semibold">图片提示词</h2></div><button onClick={toggle} title={collapsed?"展开二级导航":"收起二级导航"} className="grid h-8 w-8 shrink-0 place-items-center rounded border border-border bg-white text-muted hover:bg-accent-subtle">{collapsed?<PanelLeftOpen size={15}/>:<PanelLeftClose size={15}/>}</button></div>
      <nav className="space-y-1">
        {NAV_ITEMS.map(({label,detail,href,icon:Icon}) => {
          const active=pathname===href;
          return <Link key={href} href={href} title={label} className={`flex h-12 items-center gap-3 rounded px-2.5 no-underline transition ${active?"bg-[#e9ede6] text-foreground":"text-muted hover:bg-[#f0f0ed] hover:text-foreground"}`}>
            <Icon size={17} strokeWidth={1.8} className="shrink-0"/><span className={`min-w-0 flex-col ${collapsed?"hidden":"flex max-[920px]:hidden"}`}><strong className="text-xs font-medium">{label}</strong><small className="mt-0.5 text-[9px] text-subtle">{detail}</small></span>
          </Link>;
        })}
      </nav>
    </aside>
  );
}
