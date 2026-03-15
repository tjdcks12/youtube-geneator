#!/usr/bin/env npx ts-node --esm
import { Command } from 'commander';
import { runPD } from '../src/orchestration/pd-runner.js';
import { runDataResearcher } from '../src/orchestration/data-researcher-runner.js';
import { runScriptWriter } from '../src/orchestration/script-writer-runner.js';
import { runStoryboardArchitect } from '../src/orchestration/storyboard-runner.js';
import { runFullPipeline } from '../src/orchestration/pipeline.js';

const program = new Command();

program
  .name('yg')
  .description('YouTube Generator - AI 기반 유튜브 콘텐츠 기획 도구')
  .version('0.2.0');

program
  .command('make <topic>')
  .description('주어진 주제로 유튜브 영상 기획안을 생성합니다 (PD 에이전트)')
  .option('-r, --ref <urls...>', '참고할 레퍼런스 URL 목록')
  .action(async (topic: string, options: { ref?: string[] }) => {
    try {
      await runPD(topic, options.ref);
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('research')
  .description('기획안을 기반으로 팩트 검증 데이터를 수집합니다 (Data Researcher)')
  .action(async () => {
    try {
      await runDataResearcher();
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('write')
  .description('기획안과 검증 데이터를 기반으로 대본을 작성합니다 (Script Writer)')
  .action(async () => {
    try {
      await runScriptWriter();
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('storyboard')
  .description('대본을 기반으로 스토리보드를 설계합니다 (Storyboard Architect)')
  .action(async () => {
    try {
      await runStoryboardArchitect();
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('pipeline <topic>')
  .description('전체 파이프라인을 실행합니다 (PD → Research → Script → Storyboard)')
  .option('-r, --ref <urls...>', '참고할 레퍼런스 URL 목록')
  .action(async (topic: string, options: { ref?: string[] }) => {
    try {
      await runFullPipeline(topic, options.ref);
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
