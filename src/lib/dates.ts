/** ISO 날짜 문자열 중 가장 최신 값을 돌려준다. 빈 목록이면 undefined. */
export function latestIso(dates: (string | undefined)[]): string | undefined {
  return dates.reduce<string | undefined>((latest, date) => {
    if (!date) return latest;
    return !latest || date > latest ? date : latest;
  }, undefined);
}
