export function pageDataToHexArray(text: string) {
  const limit = Math.min(text.length, Number.MAX_SAFE_INTEGER);
  const hex: Array<number> = [];
  for (let i = 0; i < limit; i++) {
    let code = text.charCodeAt(i);
    while (code > 255) {
      hex.push(255);
      code -= 255;
    }
    hex.push(code);
  }
  return hex;
}
