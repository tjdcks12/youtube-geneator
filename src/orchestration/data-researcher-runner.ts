import OpenAI from 'openai';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { ensureWorkspace, saveToFile } from '../utils/file-system.js';

export async function runDataResearcher(): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set. Please add it to your .env file or environment variables.');
    }

    // Read skill prompt
    const skillPath = path.join(process.cwd(), 'skills', 'data-researcher.md');
    const skillContent = fs.readFileSync(skillPath, 'utf-8');

    // Read input from previous agent (pd-plan.json)
    const planPath = path.join(process.cwd(), '.yg', 'workspace', 'pd-plan.json');
    if (!fs.existsSync(planPath)) {
      throw new Error('pd-plan.json not found. Run the PD agent first: yg make <topic>');
    }
    const planContent = fs.readFileSync(planPath, 'utf-8');

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log('\x1b[33m%s\x1b[0m', '\n🔍 Data Researcher: 팩트 검증 및 데이터 수집 중...');

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: skillContent },
        { role: 'user', content: `다음 기획안의 각 챕터에 대해 팩트 체크를 수행하라:\n\n${planContent}` },
      ],
      temperature: 0.3,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('Empty response received from OpenAI API.');
    }

    ensureWorkspace();
    const savedPath = saveToFile('.yg/workspace/verified-data.md', responseContent);

    console.log('\x1b[32m%s\x1b[0m', '✅ 검증 데이터 수집 완료');
    console.log(responseContent);
    console.log(`\nSaved to: ${savedPath}`);

    return responseContent;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Data Researcher failed: ${message}`);
  }
}
