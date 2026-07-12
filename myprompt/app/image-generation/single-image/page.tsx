"use client";
import { PromptFlowWorkspace } from "../text-to-image/page";

export default function SingleImagePage(){
  return <PromptFlowWorkspace workspace="single-image" title="单图生图提示词" studioLabel="Image studio" referenceMode="single" outputLabel="生成结果"/>;
}
