/**
 * AI 增强管线 — 对已有结构化小说补充缺失字段
 *
 * 逐章调用 LLM，根据已有内容生成缺失的:
 *   - 章节摘要 (summary)
 *   - 角色描述 (description, personality)
 *   - 地点信息
 *   - 情节摘要 (如为空)
 */

import fs from 'fs';
import path from 'path';
import type { Novel, NormalizedNovel, Character, NovelChapter } from '@/lib/types';
import { LLMFactory } from '@/lib/modules/llm';
import NovelStructuringPipeline from './novel-structuring';
import NovelService from '@/lib/novel-service';

const STORAGE_DIR = path.join(process.cwd(), 'data', 'storage');

const PROMPTS = {
  system: '你是一个精确的 JSON 输出引擎。只返回 JSON，不包含任何解释。',

  /** 补充章节摘要 */
  chapterSummary: (title: string, content: string) =>
    `请用一句话概括以下章节的内容:\n\n章节标题: ${title}\n章节内容:\n${content.slice(0, 3000)}\n\n返回 JSON: {"summary": "一句话摘要"}`,

  /** 补充角色描述 */
  characterDesc: (name: string, context: string) =>
    `根据以下文本，为角色"${name}"生成简短描述和性格特征:\n\n${context.slice(0, 2000)}\n\n返回 JSON: {"description": "外貌/背景描述", "personality": "性格特征"}`,

  /** 补充全书摘要 */
  plotSummary: (title: string, author: string, chapters: string) =>
    `请用 2-3 句话概括以下小说的情节:\n书名: ${title}\n作者: ${author}\n章节概要:\n${chapters}\n\n返回 JSON: {"plot_summary": "情节摘要"}`,
};

export interface EnhancementProgress {
  stage: string;
  detail: string;
  current?: number;
  total?: number;
}

export class NovelEnhancementPipeline {
  static async execute(
    novelId: string,
    onProgress?: (progress: EnhancementProgress) => void
  ): Promise<{ success: boolean; data?: NormalizedNovel; error?: string }> {
    const novel = NovelService.getById(novelId);
    if (!novel) return { success: false, error: '小说不存在' };

    // 加载现有结构化数据
    let data = NovelStructuringPipeline.loadNormalizedData(novelId);
    if (!data) return { success: false, error: '结构化数据不存在，请先执行结构化分析' };

    try {
      // 1. 补充全书摘要
      if (!data.plot_summary || data.plot_summary.includes('待分析')) {
        onProgress?.({ stage: 'summary', detail: '生成全书摘要...' });
        data = await enhancePlotSummary(data);
      }

      // 2. 补充角色描述
      const charsNeedingDesc = data.characters.filter((c) => !c.description || !c.personality);
      if (charsNeedingDesc.length > 0) {
        onProgress?.({ stage: 'characters', detail: `补充 ${charsNeedingDesc.length} 个角色描述...`, total: charsNeedingDesc.length });
        data = await enhanceCharacters(data);
      }

      // 3. 逐章补充摘要
      const chaptersNeedingSummary = data.chapters.filter((ch) => !ch.summary || ch.summary.includes('待分析'));
      if (chaptersNeedingSummary.length > 0) {
        onProgress?.({ stage: 'chapters', detail: `补充 ${chaptersNeedingSummary.length} 个章节摘要...`, total: chaptersNeedingSummary.length });

        for (let i = 0; i < data.chapters.length; i++) {
          const ch = data.chapters[i];
          if (!ch.summary || ch.summary.includes('待分析')) {
            onProgress?.({ stage: 'chapters', detail: `生成摘要: ${ch.title}`, current: i + 1, total: data.chapters.length });
            try {
              const prompt = PROMPTS.chapterSummary(ch.title, ch.content);
              const result = await LLMFactory.chat(
                [{ role: 'system', content: PROMPTS.system }, { role: 'user', content: prompt }],
                { temperature: 0.3, maxTokens: 300 }
              );
              const parsed = safeJson(result.content);
              if (parsed?.summary) {
                data.chapters[i] = { ...ch, summary: parsed.summary };
              }
            } catch { /* skip */ }
          }
        }
      }

      // 保存
      onProgress?.({ stage: 'save', detail: '保存增强数据...' });
      await NovelStructuringPipeline.saveNormalizedData(novelId, data);
      NovelService.setNormalizedPath(novelId, path.join(novelId, 'normalized.json'));

      onProgress?.({ stage: 'done', detail: '增强完成' });
      return { success: true, data };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
}

async function enhancePlotSummary(data: NormalizedNovel): Promise<NormalizedNovel> {
  try {
    const chaptersInfo = data.chapters
      .slice(0, 15)
      .map((ch) => `${ch.title}: ${ch.summary || '(无摘要)'}`)
      .join('\n');

    const prompt = PROMPTS.plotSummary(data.metadata.title, data.metadata.author, chaptersInfo);
    const result = await LLMFactory.chat(
      [{ role: 'system', content: PROMPTS.system }, { role: 'user', content: prompt }],
      { temperature: 0.5, maxTokens: 500 }
    );
    const parsed = safeJson(result.content);
    if (parsed?.plot_summary) {
      return { ...data, plot_summary: parsed.plot_summary };
    }
  } catch { /* skip */ }
  return data;
}

async function enhanceCharacters(data: NormalizedNovel): Promise<NormalizedNovel> {
  const context = data.chapters.slice(0, 5).map((ch) => ch.content).join('\n');
  const updated = [...data.characters];

  for (let i = 0; i < updated.length; i++) {
    const c = updated[i];
    if (!c.description || !c.personality) {
      try {
        const prompt = PROMPTS.characterDesc(c.name, context);
        const result = await LLMFactory.chat(
          [{ role: 'system', content: PROMPTS.system }, { role: 'user', content: prompt }],
          { temperature: 0.4, maxTokens: 400 }
        );
        const parsed = safeJson(result.content);
        if (parsed) {
          updated[i] = {
            ...c,
            description: parsed.description || c.description,
            personality: parsed.personality || c.personality,
          };
        }
      } catch { /* skip */ }
    }
  }
  return { ...data, characters: updated };
}

function safeJson(content: string): Record<string, string> | null {
  try { return JSON.parse(content); } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (match) { try { return JSON.parse(match[0]); } catch { return null; } }
    return null;
  }
}
