// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { remarkNormalizeCaptures } from './src/lib/captures';

// https://astro.build/config
export default defineConfig({
  // canonical·og:url·sitemap 생성에 쓰인다
  site: 'https://interlinear.work',
  markdown: {
    // 붙여넣은 캡처의 상대 경로(../../public/…)를 /captures/… 로.
    // Astro 7 기본 처리기(Sätteri)는 remarkPlugins 대신 processor 로 받는다
    processor: satteri({ mdastPlugins: [remarkNormalizeCaptures()] }),
    shikiConfig: {
      // 흑백 지면 톤에 맞는 밝은 테마. 기본값(github-dark)은 코드 블록만 검게 뜬다
      theme: 'github-light',
      wrap: false,
    },
  },
});
