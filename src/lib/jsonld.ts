import { SITE } from './site';

// JSON-LD 조각. 사람은 <meta>를 읽지만 기계는 이걸 읽는다.
// 핵심은 "글"과 "쓴 사람"이 하나의 엔티티로 이어지는 것 —
// AI가 "Fabric 온톨로지를 아는 사람" 같은 질문에 이 사이트를 근거로 쓰려면
// 글과 저자가 따로 놀면 안 된다.

export const PERSON_ID = `${SITE.url}/about/#person`;
export const SITE_ID = `${SITE.url}/#website`;

export function person() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: SITE.author,
    // email 은 싣지 않는다. 엔티티를 묶는 일은 @id·url·sameAs 가 하므로 빠져도 손해가 없는데,
    // "email" 이라는 이름표가 붙은 필드는 본문 텍스트와 달리 파싱 한 줄로 걷어갈 수 있어
    // 수집기에게 가장 값싼 표적이 된다. 사람이 읽을 주소는 화면에만 둔다.
    url: `${SITE.url}/about/`,
    description: SITE.description,
    knowsAbout: [...SITE.knowsAbout],
    // 외부 프로필이 없으면 빈 배열을 내보내지 않고 항목 자체를 뺀다
    ...(SITE.sameAs.length > 0 ? { sameAs: [...SITE.sameAs] } : {}),
  };
}

export function website() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: SITE.name,
    url: `${SITE.url}/`,
    description: SITE.description,
    inLanguage: 'ko',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** 여러 조각을 하나의 @graph 로 묶는다. 스크립트 태그를 여러 개 두는 것보다 명확하다 */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
