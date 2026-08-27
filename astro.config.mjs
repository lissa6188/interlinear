// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // canonical·og:url·sitemap 생성에 쓰인다
  site: 'https://interlinear.work',
  markdown: {
    shikiConfig: {
      // 흑백 지면 톤에 맞는 밝은 테마. 기본값(github-dark)은 코드 블록만 검게 뜬다
      theme: 'github-light',
      wrap: false,
    },
  },
});
