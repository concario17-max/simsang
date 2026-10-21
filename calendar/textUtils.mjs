/**
 * Normalizes all newline variants to LF.
 */
export function normalizeNewlines(text        )         {
  return String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Inserts a visual line break inside long parenthesized text at the space
 * closest to the midpoint. This is purely for display balance.
 */
export function applySentenceBalance(text        )         {
  const escapeHtml = (s        ) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safe = escapeHtml(String(text || ''));

  return safe.replace(/\(([^)]+)\)/g, (match        , inner        ) => {
    if (inner.length < 25) return match;

    const mid = Math.floor(inner.length / 2);
    let best = -1;
    let min = Infinity;

    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === ' ') {
        const diff = Math.abs(i - mid);
        if (diff < min) {
          min = diff;
          best = i;
        }
      }
    }

    if (best !== -1) {
      return `(${inner.substring(0, best)}<br>${inner.substring(best + 1)})`;
    }

    return match;
  });
}

/**
 * Parses blocks that begin with a numbered prefix like "25. ".
 */
export function parseNumberedBlocks(text        )                      {
  const t = normalizeNewlines(text);
  const re = /^(\d+)\.\s/mg;
  const starts                                 = [];
  let m                        ;

  while ((m = re.exec(t)) !== null) {
    starts.push({ num: Number(m[1]), idx: m.index });
  }

  const map = new Map                ();
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1].idx : t.length;
    map.set(start.num, t.slice(start.idx, end).trim());
  }
  return map;
}
