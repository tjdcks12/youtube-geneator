import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ensureWorkspace, saveToFile } from '../utils/file-system.js';

export async function runPD(topic: string, refUrls?: string[]): Promise<object> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        'OPENAI_API_KEY is not set. Please add it to your .env file or environment variables.'
      );
    }

    const skillPath = path.join(process.cwd(), 'skills', 'youtube-pd.md');
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let userMessage = topic;
    if (refUrls && refUrls.length > 0) {
      userMessage += '\n\n[참고 자료]\n' + refUrls.map(url => `- ${url}`).join('\n');
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: skillContent },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.8,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response received from OpenAI API.');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(responseContent);
    } catch {
      const match = responseContent.match(/```json\s*([\s\S]*?)```/);
      if (match && match[1]) {
        try {
          parsed = JSON.parse(match[1].trim());
        } catch {
          throw new Error(
            'Invalid JSON response from OpenAI: could not parse content or extract JSON from markdown code block.'
          );
        }
      } else {
        throw new Error(
          'Invalid JSON response from OpenAI: response is not valid JSON and contains no markdown JSON code block.'
        );
      }
    }

    ensureWorkspace();

    const savedPath = saveToFile('.yg/workspace/pd-plan.json', JSON.stringify(parsed, null, 2));

    const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;

    console.log(cyan(`\nTitle: ${parsed.title ?? '(no title)'}`));
    console.log(`Hook Strategy: ${parsed.hook_strategy ?? '(none)'}`);

    if (Array.isArray(parsed.chapters)) {
      console.log('\nChapters:');
      parsed.chapters.forEach((chapter: any, index: number) => {
        console.log(`  ${index + 1}. ${typeof chapter === 'string' ? chapter : JSON.stringify(chapter)}`);
      });
    }

    console.log(`\nPlan saved to: ${savedPath}`);

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`runPD failed: ${message}`);
  }
}
