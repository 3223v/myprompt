"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "图片生成", href: "/image-generation" },
  { label: "常用", href: "/common" },
  { label: "视频生成", href: "/video-generation" },
  { label: "其他", href: "/other" },
];

const STORAGE_KEY = "myprompt-nav-pos";
const CIRCLE_SIZE = 48;
const NAV_WIDTH = 520;
const NAV_HEIGHT = 44;

export default function FloatingNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 0,
    posY: 0,
  });
  const initialized = useRef(false);

  // 恢复保存的位置，或居中
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPos(clampPosition(parsed.x, parsed.y));
        return;
      } catch {
        // ignore
      }
    }
    // 默认居中
    center();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const center = useCallback(() => {
    const x = (window.innerWidth - (collapsed ? CIRCLE_SIZE : NAV_WIDTH)) / 2;
    const y = (window.innerHeight - (collapsed ? CIRCLE_SIZE : NAV_HEIGHT)) / 2;
    setPos({ x, y });
  }, [collapsed]);

  function clampPosition(x: number, y: number) {
    const w = collapsed ? CIRCLE_SIZE : NAV_WIDTH;
    const h = collapsed ? CIRCLE_SIZE : NAV_HEIGHT;
    return {
      x: Math.max(0, Math.min(x, window.innerWidth - w)),
      y: Math.max(0, Math.min(y, window.innerHeight - h)),
    };
  }

  function savePosition(x: number, y: number) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }));
  }

  // 窗口大小变化时修正位置
  useEffect(() => {
    function onResize() {
      setPos((prev) => clampPosition(prev.x, prev.y));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  function handleMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).tagName === "A") return;
    e.preventDefault();
    setDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  }

  useEffect(() => {
    if (!dragging) return;

    function onMouseMove(e: MouseEvent) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.posX + dx;
      const newY = dragRef.current.posY + dy;
      const clamped = clampPosition(newX, newY);
      setPos(clamped);
    }

    function onMouseUp() {
      setDragging(false);
      setPos((prev) => {
        savePosition(prev.x, prev.y);
        return prev;
      });
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  function toggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      // 重新计算位置避免出界
      setTimeout(() => {
        setPos((p) => clampPosition(p.x, p.y));
      }, 0);
      return next;
    });
  }

  return (
    <>
      {/* 折叠态：小圆圈 */}
      {collapsed ? (
        <div
          onMouseDown={handleMouseDown}
          onDoubleClick={toggleCollapse}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            zIndex: 9999,
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          <div
            className="flex items-center justify-center rounded-full border border-[#444] bg-black/90 backdrop-blur-sm hover:border-white transition-colors"
            style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="5" r="1.5" fill="white" />
              <circle cx="12" cy="12" r="1.5" fill="white" />
              <circle cx="12" cy="19" r="1.5" fill="white" />
            </svg>
          </div>
        </div>
      ) : (
        /* 展开态：导航栏 */
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            width: NAV_WIDTH,
            height: NAV_HEIGHT,
            zIndex: 9999,
            cursor: dragging ? "grabbing" : "grab",
            userSelect: "none",
          }}
        >
          <nav className="flex items-center h-full px-0.5 rounded-lg border border-[#444] bg-black/90 backdrop-blur-sm overflow-hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex items-center justify-center h-full text-xs font-medium tracking-wider uppercase transition-colors border-r border-[#333] last:border-r-0 ${
                  pathname === item.href
                    ? "text-white bg-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
                style={{ cursor: "pointer" }}
              >
                {item.label}
              </Link>
            ))}
            {/* 折叠按钮 */}
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center h-full px-2 text-zinc-500 hover:text-white transition-colors border-l border-[#333]"
              style={{ cursor: "pointer" }}
              title="折叠导航"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
