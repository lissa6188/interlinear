// 사이트 전역 상수. 문구·연락처를 바꿀 일이 생기면 여기 한 곳만 고친다.

/**
 * 주로 다루는 제품. 첫 화면의 제품 라인 표시와 구조화 데이터(knowsAbout)가
 * 같은 목록을 쓴다 — 화면에 쓴 것과 기계에 알리는 것이 어긋나지 않게.
 *
 * itemPrefix 는 하위 항목을 구조화 데이터로 내보낼 때 앞에 붙일 이름이다.
 * 'Sales' 하나로는 무엇의 Sales 인지 알 수 없어 'Dynamics 365 Sales' 로 만든다.
 * 'Power BI' 처럼 그 자체로 제품명인 항목은 빈 문자열을 두어 그대로 내보낸다.
 */
export const PRODUCTS = [
  {
    name: 'Dynamics 365 CRM',
    itemPrefix: 'Dynamics 365',
    items: ['Sales', 'Customer Service', 'Marketing', 'Contact Center'],
  },
  {
    name: 'Microsoft Fabric',
    itemPrefix: '',
    items: ['Power BI', 'Fabric App', 'Fabric Agent'],
  },
  {
    name: 'Copilot Studio & Power Platform',
    itemPrefix: '',
    items: ['Copilot Studio', 'AI Agent', 'Power Apps', 'Power Automate'],
  },
] as const;

const PRODUCT_TOPICS = PRODUCTS.flatMap((product) => [
  product.name,
  ...product.items.map((item) => (product.itemPrefix ? `${product.itemPrefix} ${item}` : item)),
]);

/**
 * 마스트헤드에 로고 옆으로 붙는 컨셉 문구. 같은 구조를 세 층위로 반복한다.
 * 브라우저 탭 제목에는 첫 줄만 쓴다 — 셋을 다 넣으면 검색 결과에서 잘린다.
 */
export const TAGLINES = [
  '실무자와 개발자 사이',
  '비즈니스 앱과 에이전트 사이',
  '자연어와 기계어 사이',
] as const;

export const SITE = {
  name: 'interlinear',
  domain: 'interlinear.work',
  url: 'https://interlinear.work',
  author: 'Lissa',
  /**
   * 공개용 주소는 개인 메일함이 아니라 도메인 별칭이다. 이 값은 푸터·소개·글 하단까지
   * 여섯 곳으로 퍼지므로 수집 자체는 피할 수 없다. 그래서 숨기는 대신 버릴 수 있게 만든다 —
   * 스팸이 몰리면 별칭만 폐기·교체하면 되고 개인 메일함은 건드려지지 않는다.
   * 실제 수신은 Cloudflare Email Routing 이 개인 메일함으로 넘겨준다.
   */
  email: 'hello@interlinear.work',
  /** 탭 제목·RSS 용 짧은 한 줄. 화면에 보이는 세 줄은 TAGLINES 를 쓴다 */
  tagline: TAGLINES[0],
  // 히어로 첫 줄. 마스트헤드가 이미 "개발자와 실무자 사이"를 크게 말하므로
  // 여기서는 반복하지 않고 무엇을 다루는지를 말한다.
  lede: '현장에서 기술과 업무를 잇습니다.',
  description:
    'Dynamics 365 CRM(Sales·Customer Service·Marketing·Contact Center), Microsoft Fabric, Power Platform 실무에서 실제로 부딪힌 문제와 해결 과정을 기록합니다.',

  /**
   * 구조화 데이터(JSON-LD)의 knowsAbout. AI가 "이 사람은 무엇을 아는가"를
   * 판단하는 근거가 된다. 앞쪽은 PRODUCTS 에서 자동으로 오고,
   * 제품군으로 묶이지 않는 주제만 뒤에 덧붙인다.
   */
  // Set 으로 감싸 제품 목록과 아래 항목이 겹쳐도 중복이 나가지 않게 한다
  knowsAbout: [...new Set([...PRODUCT_TOPICS, 'OneLake', 'Dataverse', 'ERP 이관 검증'])],

  /**
   * 같은 사람임을 기계가 확인할 수 있는 외부 프로필 주소.
   * LinkedIn·GitHub·Microsoft Learn 프로필 등을 넣으면 엔티티가 하나로 묶인다.
   * 비어 있으면 JSON-LD에서 통째로 빠진다.
   */
  sameAs: [] as string[],
} as const;

export const NAV = [
  { href: '/', label: '홈' },
  { href: '/notes/', label: '노트' },
  { href: '/study/', label: '스터디' },
  { href: '/about/', label: '소개' },
] as const;
