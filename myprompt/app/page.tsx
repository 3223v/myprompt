export default function HomePage() {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-full px-8">
      <div className="text-center max-w-2xl">
        {/* 标题 */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            myprompt
          </h1>
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-zinc-600" />
            <span className="text-sm text-zinc-500 tracking-[0.3em] uppercase">
              提示词管理
            </span>
            <span className="h-px w-8 bg-zinc-600" />
          </div>
        </div>

        {/* 项目信息卡片 */}
        <div className="grid grid-cols-1 gap-px bg-[#333] border border-[#333]">
          {[
            { label: "项目名称", value: "myprompt" },
            { label: "技术栈", value: "Next.js 16 + React 19 + Tailwind CSS 4" },
            { label: "持久化", value: "SQLite (better-sqlite3)" },
            { label: "配色", value: "Black / White" },
            { label: "版本", value: "0.1.0" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between px-6 py-4 bg-black"
            >
              <span className="text-xs tracking-widest uppercase text-zinc-500">
                {label}
              </span>
              <span className="text-sm text-zinc-300 font-mono">{value}</span>
            </div>
          ))}
        </div>

        {/* 底部装饰 */}
        <div className="mt-16 flex flex-col items-center gap-2">
          <span className="h-px w-32 bg-[#333]" />
          <span className="text-xs text-zinc-600 tracking-widest">
            PROMPT MANAGEMENT SYSTEM
          </span>
        </div>
      </div>
    </div>
  );
}
