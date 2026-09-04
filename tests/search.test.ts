import test from 'node:test';
import assert from 'node:assert/strict';
import { aliasTerms, buildHaystack, expandTokens, highlight, matches, snippet, tokenize } from '../src/lib/search.ts';

test('별칭은 한글과 영문 어느 방향에서도 같은 그룹으로 확장된다', () => {
  assert.match(aliasTerms('Power BI 보고서'), /파워비아이/);
  assert.match(aliasTerms('파워비아이 보고서'), /power bi/);
  assert.match(aliasTerms('다이나믹스 설정'), /d365/);
  assert.match(aliasTerms('D365 설정'), /다이나믹스/);
});

test('확장된 색인은 복합 검색어를 AND 조건으로 찾는다', () => {
  const haystack = buildHaystack(['파워비아이 Fabric 연동']);
  assert.equal(matches(haystack, tokenize('Power BI 패브릭')), true);
  assert.equal(matches(haystack, tokenize('Power BI ontology')), false);
});

test('별칭 검색어는 실제 본문 표기까지 강조할 수 있게 확장된다', () => {
  assert.deepEqual(expandTokens(tokenize('패브릭')), ['패브릭', 'fabric']);
  assert.match(highlight('Microsoft Fabric', expandTokens(tokenize('패브릭'))), /<mark>Fabric<\/mark>/);
});

test('검색 강조는 HTML을 이스케이프하고 검색어만 mark로 감싼다', () => {
  assert.equal(highlight('<script>Power BI</script>', ['power']), '&lt;script&gt;<mark>Power</mark> BI&lt;/script&gt;');
});

test('본문 스니펫은 일치 지점 주변만 반환한다', () => {
  assert.equal(snippet('앞 문장과 Fabric을 설명하는 뒤 문장', ['fabric'], 4), '…문장과 Fabric을 설명…');
  assert.equal(snippet('본문', ['없는말']), null);
});
