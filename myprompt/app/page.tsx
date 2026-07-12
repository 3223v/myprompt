import Link from "next/link";
import { ArrowUpRight, Image, Library, Video, Workflow } from "lucide-react";

const workspaces = [
  { title: "图片提示词", desc: "按版本与迭代整理生成提示词", href: "/image-generation/text-to-image", icon: Image, meta: "可视化版本树", featured: true },
  { title: "常用片段", desc: "沉淀可复用的描述与参数", href: "/common", icon: Library, meta: "待建设" },
  { title: "视频提示词", desc: "组织镜头、运动与节奏描述", href: "/video-generation", icon: Video, meta: "待建设" },
];

export default function HomePage() {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex min-h-full max-w-[1180px] flex-col px-8 py-8 md:px-12 md:py-10">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <div>
            <p className="text-[10px] font-semibold uppercase text-muted">Workspace / Overview</p>
            <h1 className="mt-1 text-lg font-semibold">提示词工作台</h1>
          </div>
          <span className="rounded border border-border bg-surface px-2.5 py-1.5 font-mono text-[10px] text-muted">LOCAL / v0.1.0</span>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="max-w-[600px]">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted"><i className="h-1.5 w-1.5 rounded-full bg-[#6f895f]" />个人创作资料库</span>
            <h2 className="mt-6 text-[clamp(2.7rem,5vw,5.2rem)] font-semibold leading-[.98] text-foreground">让每一次<br />迭代都有迹可循。</h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-muted">管理提示词的版本、迭代与上下文。把零散尝试整理成可复用、可回溯的创作资产。</p>
            <Link href="/image-generation/text-to-image" className="mt-8 inline-flex h-11 items-center gap-3 rounded bg-accent px-4 text-sm font-medium text-white no-underline transition hover:bg-accent-hover">
              进入图片工作区 <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-md border border-[#33372f] bg-[#20231f] p-7 text-white shadow-[0_24px_60px_rgba(27,30,25,.15)]">
            <div className="absolute inset-0 opacity-[.07]" style={{backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
            <div className="relative flex items-center justify-between"><span className="font-mono text-[10px] text-[#92998d]">PROMPT MAP / 01</span><Workflow size={18} className="text-[#a8bca0]" /></div>
            <div className="relative mt-14 space-y-6">
              {["Product photography / v1","Light & material / v2","Final composition / v3"].map((item, i) => (
                <div key={item} className="flex items-center gap-4" style={{marginLeft:`${i*28}px`}}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded border border-[#4a5046] bg-[#292d27] font-mono text-[10px] text-[#aab4a4]">0{i+1}</span>
                  <div className="h-px w-8 bg-[#4a5046]" />
                  <div className="flex-1 rounded border border-[#41463e] bg-[#282c26] px-4 py-3 text-xs text-[#d9ddd5]">{item}</div>
                </div>
              ))}
            </div>
            <p className="absolute bottom-6 left-7 font-mono text-[9px] text-[#747b70]">VERSIONED CREATIVE MEMORY</p>
          </div>
        </section>

        <section className="border-t border-border pt-6">
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {workspaces.map(({title,desc,href,icon:Icon,meta,featured}) => (
              <Link key={title} href={href} className="group bg-surface p-5 text-foreground no-underline transition hover:bg-[#fafbf8]">
                <div className="flex items-start justify-between"><Icon size={18} strokeWidth={1.7} className={featured?"text-[#5e7556]":"text-muted"}/><ArrowUpRight size={15} className="text-subtle transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></div>
                <h3 className="mt-8 text-sm font-semibold">{title}</h3><p className="mt-2 text-xs leading-5 text-muted">{desc}</p><span className="mt-5 block font-mono text-[9px] uppercase text-subtle">{meta}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
