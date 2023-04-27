/**
 * null, undefinedを除去するタイプガードです。Array.filterでnullableな値を除去する際に利用できます
 * @param value nullable判定を行う値
 */
export const notNull = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined; // eslint-disable-line no-undefined
