/**
 * ✅ JWT 문자열에서 payload(중앙 부분)를 추출해 JSON으로 반환합니다.
 * - atob + decodeURIComponent로 안전하게 디코딩
 * - 실패하면 null 반환
 */

export function jwtParser<T = any>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('❌ JWT 파싱 실패:', err)
    return null
  }
}
