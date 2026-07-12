"use client";
import { PromptFlowWorkspace } from "../image-generation/text-to-image/page";

export default function VideoGenerationPage(){
  return <PromptFlowWorkspace workspace="video-generation" title="视频生成提示词" studioLabel="Video studio" embeddedInImageStudio={false} outputLabel="视频与封面" assetKind="media"/>;
}
