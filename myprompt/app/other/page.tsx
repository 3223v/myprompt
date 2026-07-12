"use client";
import { PromptFlowWorkspace } from "../image-generation/text-to-image/page";

export default function OtherPage(){
  return <PromptFlowWorkspace workspace="other" title="其他提示词" studioLabel="General workspace" embeddedInImageStudio={false} outputLabel="附件素材"/>;
}
