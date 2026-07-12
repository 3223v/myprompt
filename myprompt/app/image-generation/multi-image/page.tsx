"use client";
import { PromptFlowWorkspace } from "../text-to-image/page";

export default function MultiImagePage(){
  return <PromptFlowWorkspace workspace="multi-image" title="多图组合提示词" studioLabel="Image studio" referenceMode="multi" outputLabel="组合结果"/>;
}
