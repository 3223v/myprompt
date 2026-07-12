"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useState } from "react";
import { Check, Copy, GitBranch } from "lucide-react";

export type PromptNodeData = { id:number; project_name:string; version:number; iteration:number; content:string; };

export default function PromptNode({ data, selected }: NodeProps) {
  const nodeData=data as unknown as PromptNodeData;
  const [copied,setCopied]=useState(false);
  const preview=nodeData.content.length>58?`${nodeData.content.slice(0,58)}...`:nodeData.content||"暂无提示词内容";
  return (
    <article className={`w-[224px] select-none overflow-hidden rounded-md border bg-white transition-all ${selected?"border-[#667d5d] shadow-[0_0_0_3px_rgba(94,117,86,.13),0_12px_30px_rgba(31,35,29,.12)]":"border-border shadow-sm hover:-translate-y-0.5 hover:border-border-hover hover:shadow-md"}`}>
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-2 !border-white !bg-[#8b9485]" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-2 !border-white !bg-[#8b9485]" />
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3"><div className="flex min-w-0 items-center gap-2"><GitBranch size={14} className="shrink-0 text-[#65765e]"/><strong className="truncate text-xs font-semibold">{nodeData.project_name}</strong></div><button className="nodrag nopan grid h-7 w-7 place-items-center rounded border-0 bg-transparent text-subtle hover:bg-accent-subtle hover:text-foreground" title="复制提示词" onClick={async e=>{e.stopPropagation();await navigator.clipboard.writeText(nodeData.content);setCopied(true);setTimeout(()=>setCopied(false),1400);}}>{copied?<Check size={13}/>:<Copy size={13}/>}</button></div>
      <p className="min-h-[61px] px-3.5 py-3 text-[11px] leading-[1.65] text-muted">{preview}</p>
      <footer className="flex border-t border-border bg-[#fafaf8] font-mono text-[9px] text-muted"><span className="flex-1 px-3 py-2">VER {nodeData.version}</span><span className="border-l border-border px-3 py-2">ITER {nodeData.iteration}</span></footer>
    </article>
  );
}
