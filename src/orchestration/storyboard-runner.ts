import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ensureWorkspace, saveToFile } from '../utils/file-system.js';

interface Scene {
  scene_id: string;
  text_segment: string;
  image_prompt: string;
}

export async function runStoryboardArchitect(): Promise<Scene[]> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Please add it to your .env file or environment variables.');
    }

    // Read skill prompt
    const skillPath = path.join(process.cwd(), 'skills', 'storyboard-architect.md');
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    // Read input from previous agent (script)
    const scriptPath = path.join(process.cwd(), '.yg', 'workspace', 'pd-script.md');
    if (!fs.existsSync(scriptPath)) {
      throw new Error('pd-script.md not found. Run the Script Writer agent first.');
    }
    const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log('\x1b[33m%s\x1b[0m', '\n🎬 Storyboard Architect: 스토리보드 설계 중...');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: skillContent },
        { role: 'user', content: `다음 대본을 씬 단위로 분할하고, 각 씬의 이미지 프롬프트를 생성하라:\n\n${scriptContent}` },
      ],
      temperature: 0.6,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response received from OpenAI API.');
    }

    // Parse JSON response
    let scenes: Scene[];
    try {
      scenes = JSON.parse(responseContent);
    } catch {
      // Try extracting from markdown code block
      const match = responseContent.match(/```json\s*([\s\S]*?)```/);
      if (match && match[1]) {
        try {
          scenes = JSON.parse(match[1].trim());
        } catch {
          throw new Error('Invalid JSON response: could not parse storyboard scenes.');
        }
      } else {
        throw new Error('Invalid JSON response: storyboard output is not valid JSON.');
      }
    }

    if (!Array.isArray(scenes)) {
      throw new Error('Invalid response: expected a JSON array of scenes.');
    }

    ensureWorkspace();
    const savedPath = saveToFile('.yg/workspace/storyboard.json', JSON.stringify(scenes, null, 2));

    // Pretty print scenes
    const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
    console.log('\x1b[32m%s\x1b[0m', '✅ 스토리보드 설계 완료');
    console.log(`\n총 ${scenes.length}개 씬 생성:\n`);
    for (const scene of scenes) {
      console.log(cyan(`[Scene ${scene.scene_id}]`));
      console.log(`  대본: ${scene.text_segment}`);
      console.log(`  프롬프트: ${scene.image_prompt}\n`);
    }
    console.log(`Saved to: ${savedPath}`);

    return scenes;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Storyboard Architect failed: ${message}`);
  }
}
