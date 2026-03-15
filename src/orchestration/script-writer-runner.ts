import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ensureWorkspace, saveToFile } from '../utils/file-system.js';

export async function runScriptWriter(): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Please add it to your .env file or environment variables.');
    }

    // Read skill prompt
    const skillPath = path.join(process.cwd(), 'skills', 'script-writer.md');
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    // Read inputs from previous agents
    const planPath = path.join(process.cwd(), '.yg', 'workspace', 'pd-plan.json');
    if (!fs.existsSync(planPath)) {
      throw new Error('pd-plan.json not found. Run the PD agent first.');
    }
    const planContent = fs.readFileSync(planPath, 'utf-8');

    const dataPath = path.join(process.cwd(), '.yg', 'workspace', 'verified-data.md');
    if (!fs.existsSync(dataPath)) {
      throw new Error('verified-data.md not found. Run the Data Researcher agent first.');
    }
    const dataContent = fs.readFileSync(dataPath, 'utf-8');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log('\x1b[33m%s\x1b[0m', '\n✍️  Script Writer: 대본 작성 중...');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: skillContent },
        {
          role: 'user',
          content: `[기획안]\n${planContent}\n\n[검증된 데이터]\n${dataContent}\n\n위 기획안과 데이터를 바탕으로 영상 대본을 작성하라.`,
        },
      ],
      temperature: 0.7,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response received from OpenAI API.');
    }

    ensureWorkspace();
    const savedPath = saveToFile('.yg/workspace/pd-script.md', responseContent);

    console.log('\x1b[32m%s\x1b[0m', '✅ 대본 작성 완료');
    console.log(responseContent);
    console.log(`\nSaved to: ${savedPath}`);

    return responseContent;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Script Writer failed: ${message}`);
  }
}
