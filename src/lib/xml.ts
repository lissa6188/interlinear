/** RSS·사이트맵에 문자열을 넣을 때. 제목에 & 나 < 가 들어가면 피드가 통째로 깨진다 */
export function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] as string
  );
}
