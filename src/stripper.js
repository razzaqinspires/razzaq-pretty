export function stripCommentsSafe(src) {
  let out = '';
  const len = src.length;
  let i = 0;
  let state = 'NORMAL';
  while (i < len) {
    const ch = src[i];
    const next = src[i + 1];
    if (state === 'NORMAL') {
      if (ch === '/' && next === '/') { state = 'LINE_COMMENT'; i += 2; continue; }
      if (ch === '/' && next === '*') { state = 'BLOCK_COMMENT'; i += 2; continue; }
      if (ch === '"') { out += ch; state = 'DOUBLE_QUOTE'; i++; continue; }
      if (ch === '\'') { out += ch; state = 'SINGLE_QUOTE'; i++; continue; }
      if (ch === '`') { out += ch; state = 'TEMPLATE'; i++; continue; }
    }
    if (state === 'LINE_COMMENT') { if (ch === '\n') { out += ch; state = 'NORMAL'; } i++; continue; }
    if (state === 'BLOCK_COMMENT') { if (ch === '*' && next === '/') { state = 'NORMAL'; i += 2; continue; } i++; continue; }
    if (state === 'DOUBLE_QUOTE') { if (ch === '\\') { out += ch + next; i += 2; continue; } if (ch === '"') { state = 'NORMAL'; } out += ch; i++; continue; }
    if (state === 'SINGLE_QUOTE') { if (ch === '\\') { out += ch + next; i += 2; continue; } if (ch === '\'') { state = 'NORMAL'; } out += ch; i++; continue; }
    if (state === 'TEMPLATE') { if (ch === '\\') { out += ch + next; i += 2; continue; } if (ch === '`') { state = 'NORMAL'; } out += ch; i++; continue; }
    out += ch; i++;
  }
  return out;
}
