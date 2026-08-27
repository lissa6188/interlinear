import type { APIRoute } from 'astro';
import { SITE } from '../lib/site';

// AI 리서치에 걸리는 것이 목적이므로 인용용·학습용 크롤러를 모두 허용한다.
// 특정 봇을 막고 싶으면 아래 목록에서 빼고 Disallow 블록으로 옮기면 된다.
// robots.txt 는 요청이지 강제가 아니다 — 실제 차단은 Cloudflare 봇 관리로 한다.
const CITATION_BOTS = [
  'OAI-SearchBot', // ChatGPT 검색 색인
  'ChatGPT-User', // 사용자가 물을 때 직접 가져감
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
];

const TRAINING_BOTS = [
  'GPTBot', // OpenAI 학습
  'ClaudeBot', // Anthropic 학습
  'Google-Extended', // Gemini 학습·그라운딩
  'CCBot', // Common Crawl
  'meta-externalagent',
  'Applebot-Extended',
];

function allowBlock(agents: string[]): string {
  return agents.map((agent) => `User-agent: ${agent}\nAllow: /`).join('\n\n');
}

const body = `# ${SITE.domain}
# 검색엔진과 AI 크롤러를 모두 허용한다.

User-agent: *
Allow: /

# 답변에 인용하기 위해 가져가는 봇
${allowBlock(CITATION_BOTS)}

# 학습 데이터로 수집하는 봇
${allowBlock(TRAINING_BOTS)}

Sitemap: ${SITE.url}/sitemap.xml
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
