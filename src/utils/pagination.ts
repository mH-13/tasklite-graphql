export function encodeCursor(createdAtIso: string, idHex: string): string {
  return Buffer.from(JSON.stringify({ createdAtIso, idHex }), 'utf8').toString('base64');
}
export function decodeCursor(cursor: string): { createdAtIso: string; idHex: string } {
  return JSON.parse(Buffer.from(cursor, 'base64').toString('utf8'));
}
