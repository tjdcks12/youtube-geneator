import { runPD } from './pd-runner.js';
import { runDataResearcher } from './data-researcher-runner.js';
import { runScriptWriter } from './script-writer-runner.js';
import { runStoryboardArchitect } from './storyboard-runner.js';

export async function runFullPipeline(topic: string, refUrls?: string[]): Promise<void> {
  console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════');
  console.log('\x1b[35m%s\x1b[0m', '  🎬 yg Pipeline: 유튜브 영상 제작 파이프라인');
  console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════\n');

  // Stage 1: YouTube PD
  console.log('\x1b[35m%s\x1b[0m', '📋 [1/4] YouTube PD — 기획안 작성');
  await runPD(topic, refUrls);

  // Stage 2: Data Researcher
  console.log('\x1b[35m%s\x1b[0m', '\n📋 [2/4] Data Researcher — 팩트 검증');
  await runDataResearcher();

  // Stage 3: Script Writer
  console.log('\x1b[35m%s\x1b[0m', '\n📋 [3/4] Script Writer — 대본 작성');
  await runScriptWriter();

  // Stage 4: Storyboard Architect
  console.log('\x1b[35m%s\x1b[0m', '\n📋 [4/4] Storyboard Architect — 스토리보드 설계');
  await runStoryboardArchitect();

  console.log('\x1b[35m%s\x1b[0m', '\n═══════════════════════════════════════════');
  console.log('\x1b[35m%s\x1b[0m', '  ✅ 파이프라인 완료! 결과물:');
  console.log('  📄 .yg/workspace/pd-plan.json');
  console.log('  📄 .yg/workspace/verified-data.md');
  console.log('  📄 .yg/workspace/pd-script.md');
  console.log('  📄 .yg/workspace/storyboard.json');
  console.log('\x1b[35m%s\x1b[0m', '═══════════════════════════════════════════');
}
