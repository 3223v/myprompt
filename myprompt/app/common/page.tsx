"use client";
import { PromptFlowWorkspace } from "../image-generation/text-to-image/page";

export default function CommonPage(){
  return <PromptFlowWorkspace workspace="common" title="常用提示词" studioLabel="Prompt library" embeddedInImageStudio={false} outputLabel="关联素材"/>;
}
