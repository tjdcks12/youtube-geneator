#!/usr/bin/env npx ts-node --esm
import { Command } from 'commander'
import { runPD } from '../src/orchestration/pd-runner.js'

const program = new Command()

program
  .name('yg')
  .description('YouTube Generator - AI 기반 유튜브 콘텐츠 기획 도구')
  .version('0.1.0')

program
  .command('make <topic>')
  .description('주어진 주제로 유튜브 영상 기획안을 생성합니다')
  .action(async (topic: string) => {
    try {
      await runPD(topic)
    } catch (error) {
      console.error('\x1b[31m%s\x1b[0m', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

program.parse()
