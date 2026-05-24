import { WhamoNode, WhamoEdge } from './store';

// ─── Layout constants ─────────────────────────────────────────────────────────
const R   = 9;                       // circle node radius
const RRW = 42; const RRH = 26;      // reservoir / flowBoundary (w × h)
const STW = 20; const STH = 32;      // surgeTank (w × h)
const SX  = 150;                     // column pitch (px)
const SY  = 92;                      // row pitch (px)
const MG  = 85;                      // canvas margin
const LATERAL_OFFSET = 90;           // px above anchor for lateral nodes

// ─── Bright colours per type ──────────────────────────────────────────────────
const COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  reservoir:    { fill: '#2196F3', stroke: '#1565C0', text: '#fff' },
  surgeTank:    { fill: '#FF6D00', stroke: '#BF360C', text: '#fff' },
  flowBoundary: { fill: '#9C27B0', stroke: '#6A1B9A', text: '#fff' },
  node:         { fill: '#90A4AE', stroke: '#546E7A', text: '#fff' },
  junction:     { fill: '#F44336', stroke: '#B71C1C', text: '#fff' },
  pump:         { fill: '#00BCD4', stroke: '#006064', text: '#fff' },
  checkValve:   { fill: '#37474F', stroke: '#102027', text: '#fff' },
  turbine:      { fill: '#FF5722', stroke: '#BF360C', text: '#fff' },
};
function col(t: string) { return COLORS[t] ?? COLORS.node; }

// Connection-point half-extents
function nHW(t: string) {
  if (t === 'reservoir' || t === 'flowBoundary') return RRW / 2;
  if (t === 'surgeTank') return STW / 2;
  return R;
}
function nHH(t: string) {
  if (t === 'surgeTank') return STH / 2;
  if (t === 'reservoir' || t === 'flowBoundary') return RRH / 2;
  return R;
}

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Node shape ────────────────────────────────────────────────────────────────
function renderNode(type: string, x: number, y: number, label: string, srcId: string, srcType: string): string {
  const hh = nHH(type);
  const hw = nHW(type);
  const c  = col(type);

  let shape = '';
  let lbl   = '';

  if (type === 'reservoir' || type === 'flowBoundary') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="5"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y + 4}" text-anchor="middle" font-size="11"
      font-weight="700" fill="${c.text}" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else if (type === 'surgeTank') {
    shape = `<rect x="${x - hw}" y="${y - hh}" width="${hw * 2}" height="${hh * 2}" rx="4"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>
      <line x1="${x - hw + 2}" y1="${y - hh + 10}" x2="${x + hw - 2}" y2="${y - hh + 10}"
        stroke="rgba(255,255,255,0.7)" stroke-width="1.5"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - hh - 8}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  } else {
    shape = `<circle cx="${x}" cy="${y}" r="${R}"
      fill="${c.fill}" stroke="${c.stroke}" stroke-width="2"/>`;
    lbl = `<text class="lbl" x="${x}" y="${y - R - 7}" text-anchor="middle" font-size="11"
      font-weight="600" fill="#111" font-family="Arial,sans-serif">${esc(label)}</text>`;
  }

  return `<g class="ng" data-srcid="${esc(srcId)}" data-srctype="${esc(srcType)}" style="cursor:pointer">
  ${shape}
  ${lbl}
</g>`;
}

// ─── Main export ─────────────────────────────────────────────────────────────
export function generateSystemDiagramSVG(
  nodes: WhamoNode[],
  edges: WhamoEdge[],
  options: { showLabels: boolean } = { showLabels: true }
): string {
  const { showLabels } = options;

  type VN = { id: string; type: string; label: string; srcId: string; srcType: string };
  type VE = { from: string; to: string; label: string; isDummy: boolean; srcEdgeId: string };

  // Build virtual graph: edge-based elements (pump/checkValve/turbine) → inline virtual nodes
  const vns: VN[] = nodes.map(n => ({
    id:      n.id,
    type:    n.type || 'node',
    label:   String(n.data?.label ?? ''),
    srcId:   n.id,
    srcType: 'node',
  }));

  const ves: VE[] = [];

  edges.forEach(e => {
    const etype   = String(e.data?.type ?? '');
    const isElem  = etype === 'pump' || etype === 'checkValve' || etype === 'turbine';
    const isDummy = etype === 'dummy';
    const elabel  = String(e.data?.label ?? '');

    if (isElem) {
      const vid = `__v_${e.id}`;
      vns.push({ id: vid, type: etype, label: elabel, srcId: e.id, srcType: 'edge' });
      ves.push({ from: e.source, to: vid,      label: '',     isDummy: false, srcEdgeId: e.id });
      ves.push({ from: vid,      to: e.target, label: '',     isDummy: false, srcEdgeId: e.id });
    } else {
      ves.push({ from: e.source, to: e.target, label: elabel, isDummy, srcEdgeId: e.id });
    }
  });

  if (vns.length === 0) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120">'
      + '<text x="200" y="65" text-anchor="middle" font-family="Arial,sans-serif"'
      + ' font-size="14" fill="#aaa">No elements to display</text></svg>';
  }

  // ── Adjacency + in-degree ──────────────────────────────────────────────────
  const adj:    Record<string, string[]> = {};
  const adjRev: Record<string, string[]> = {};
  const inDeg:  Record<string, number>   = {};
  vns.forEach(n => { adj[n.id] = []; adjRev[n.id] = []; inDeg[n.id] = 0; });
  ves.forEach(e => {
    if (adj[e.from])   adj[e.from].push(e.to);
    if (adjRev[e.to])  adjRev[e.to].push(e.from);
    if (e.to in inDeg) inDeg[e.to] = (inDeg[e.to] || 0) + 1;
  });

  // ── Kahn's topological sort → longest-path DP ─────────────────────────────
  const inDegCopy = { ...inDeg };
  const topoQ: string[] = vns.filter(n => !inDegCopy[n.id]).map(n => n.id);
  const topoOrder: string[] = [];
  const visited = new Set<string>();

  while (topoQ.length > 0) {
    const u = topoQ.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    topoOrder.push(u);
    for (const v of (adj[u] || [])) {
      inDegCopy[v] = (inDegCopy[v] || 1) - 1;
      if (inDegCopy[v] <= 0) topoQ.push(v);
    }
  }
  vns.forEach(n => { if (!visited.has(n.id)) topoOrder.push(n.id); });

  // Longest-path DP over topo order
  const lvl: Record<string, number> = {};
  vns.forEach(n => { lvl[n.id] = 0; });
  for (const u of topoOrder) {
    for (const v of (adj[u] || [])) {
      const proposed = (lvl[u] ?? 0) + 1;
      if ((lvl[v] ?? 0) < proposed) lvl[v] = proposed;
    }
  }

  // ── Detect LATERAL nodes ───────────────────────────────────────────────────
  // A lateral node is a root (in-degree 0) with exactly 1 outgoing neighbor
  // that itself has a higher level (i.e. the lateral node branches off mid-network).
  // Classic example: a surge tank that tees into a junction.
  // These are pulled OUT of the main horizontal layout and placed
  // directly ABOVE their anchor node instead.
  const lateralSet    = new Set<string>();
  const lateralAnchor: Record<string, string> = {};  // lateralId → anchorId

  vns.forEach(n => {
    if ((inDeg[n.id] ?? 0) !== 0) return;            // must be a root
    const neighbors = adj[n.id] || [];
    if (neighbors.length !== 1) return;               // must have exactly 1 successor
    const anchorId = neighbors[0];
    if ((lvl[anchorId] ?? 0) > 0) {                  // anchor is not also a root
      lateralSet.add(n.id);
      lateralAnchor[n.id] = anchorId;
    }
  });

  // ── Group by level → exclude laterals ─────────────────────────────────────
  const byLv: Record<number, string[]> = {};
  vns.forEach(n => {
    if (lateralSet.has(n.id)) return;                 // handled separately
    const l = lvl[n.id] ?? 0;
    if (!byLv[l]) byLv[l] = [];
    byLv[l].push(n.id);
  });

  const nm: Record<string, VN> = {};
  vns.forEach(n => { nm[n.id] = n; });

  const nLevels      = Math.max(...Object.keys(byLv).map(Number)) + 1;
  const maxPerLevel  = Math.max(...Object.values(byLv).map(a => a.length));
  const labelPadV    = 32;

  // Extra top padding to accommodate lateral nodes placed above the main rows
  const topPad = lateralSet.size > 0 ? LATERAL_OFFSET + STH + 20 : 0;

  const svgW = MG * 2 + (nLevels - 1) * SX + RRW + 80;
  const svgH = Math.max(260, topPad + MG * 2 + (maxPerLevel - 1) * SY + STH + labelPadV + 40);

  const pos: Record<string, { x: number; y: number }> = {};

  // Initial vertical placement centred in the lower portion (below topPad)
  const mainTop = topPad + MG;

  Object.entries(byLv).forEach(([lStr, ids]) => {
    const l       = parseInt(lStr);
    const cx      = MG + l * SX;
    const totalH  = (ids.length - 1) * SY;
    const startY  = mainTop + (svgH - mainTop - MG) / 2 - totalH / 2;
    ids.forEach((id, i) => {
      pos[id] = { x: cx, y: startY + i * SY };
    });
  });

  // ── Re-order rows at each level by predecessor-Y score ────────────────────
  // (only score based on NON-lateral predecessors so lateral nodes don't skew rows)
  for (let l = 1; l < nLevels; l++) {
    const ids = byLv[l];
    if (!ids || ids.length < 2) continue;
    const score: Record<string, number> = {};
    ids.forEach(id => {
      const preds = ves
        .filter(ve => ve.to === id && pos[ve.from] && !lateralSet.has(ve.from))
        .map(ve => pos[ve.from].y);
      score[id] = preds.length ? preds.reduce((a, b) => a + b, 0) / preds.length : 0;
    });
    ids.sort((a, b) => (score[a] || 0) - (score[b] || 0));
    const totalH = (ids.length - 1) * SY;
    const startY = mainTop + (svgH - mainTop - MG) / 2 - totalH / 2;
    ids.forEach((id, i) => {
      pos[id] = { x: pos[id].x, y: startY + i * SY };
    });
  }

  // ── Place lateral nodes directly ABOVE their anchor ───────────────────────
  lateralSet.forEach(id => {
    const anchorId = lateralAnchor[id];
    const ap = pos[anchorId];
    if (ap) {
      pos[id] = { x: ap.x, y: ap.y - LATERAL_OFFSET };
    }
  });

  // ── Detect parallel edges ──────────────────────────────────────────────────
  const pairCount: Record<string, number> = {};
  const pairIndex: Record<string, number> = {};
  ves.forEach(ve => {
    const k = `${ve.from}→${ve.to}`;
    pairIndex[k] = (pairIndex[k] ?? -1) + 1;
    (ve as any)['_idx'] = pairIndex[k];
    pairCount[k] = (pairCount[k] ?? 0) + 1;
  });

  // ── SVG rendering ─────────────────────────────────────────────────────────
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}"
  viewBox="0 0 ${svgW} ${svgH}" style="background:white;font-family:Arial,sans-serif">
<defs>
  <marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
    <polygon points="0 0, 9 3.5, 0 7" fill="#555"/>
  </marker>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#0003"/>
  </filter>
</defs>
<style>
  .ng { cursor: pointer; }
  .cg { cursor: pointer; }
</style>
`;

  // Edges first (under nodes)
  ves.forEach(ve => {
    const p1 = pos[ve.from];
    const p2 = pos[ve.to];
    if (!p1 || !p2) return;

    const t1 = nm[ve.from]?.type || 'node';
    const t2 = nm[ve.to]?.type   || 'node';

    const isFromLateral = lateralSet.has(ve.from);
    const isToLateral   = lateralSet.has(ve.to);

    // ── Vertical edge: lateral node → its anchor (drawn top-to-bottom) ──────
    if (isFromLateral && !isToLateral) {
      const x1 = p1.x;
      const y1 = p1.y + nHH(t1);   // bottom of lateral node
      const x2 = p2.x;
      const y2 = p2.y - nHH(t2);   // top of anchor node

      const sty = 'stroke="#555" stroke-width="1.5"';
      const d   = `M${x1} ${y1} L${x2} ${y2}`;
      svg += `<path d="${d}" ${sty} fill="none" marker-end="url(#arr)"/>\n`;

      // Conduit label midpoint
      if (ve.label) {
        const lx  = x1;
        const ly  = (y1 + y2) / 2;
        const lw  = ve.label.length * 7 + 16;
        const lh  = 14;
        svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw / 2}" y="${ly - lh / 2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
      }
      return;
    }

    // ── Standard horizontal / elbow edge ─────────────────────────────────────
    const k     = `${ve.from}→${ve.to}`;
    const total = pairCount[k] || 1;
    const idx   = (ve as any)['_idx'] as number ?? 0;
    const vOff  = total > 1 ? (idx - (total - 1) / 2) * 12 : 0;

    const x1 = p1.x + nHW(t1);
    const y1 = p1.y + vOff;
    const x2 = p2.x - nHW(t2);
    const y2 = p2.y + vOff;

    const sty = ve.isDummy
      ? 'stroke="#ccc" stroke-width="1.5" stroke-dasharray="5,4"'
      : 'stroke="#555" stroke-width="1.5"';
    const mk = ve.isDummy ? '' : 'marker-end="url(#arr)"';

    let d: string;
    if (Math.abs(y1 - y2) < 3) {
      d = `M${x1} ${y1} L${x2} ${y2}`;
    } else {
      const mx = x1 + (x2 - x1) * 0.5;
      d = `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}`;
    }

    svg += `<path d="${d}" ${sty} fill="none" ${mk}/>\n`;

    // Conduit label pill
    if (ve.label) {
      const lx = Math.abs(y1 - y2) < 3
        ? (x1 + x2) / 2
        : (x1 * 3 + x2) / 4;
      const ly  = Math.abs(y1 - y2) < 3 ? y1 : y1;
      const lw  = ve.label.length * 7 + 16;
      const lh  = 14;
      svg += `<g class="cg" data-srcid="${esc(ve.srcEdgeId)}" data-srctype="edge" style="pointer-events:all;cursor:pointer">
  <rect class="lbl" x="${lx - lw / 2}" y="${ly - lh / 2}" width="${lw}" height="${lh}"
    rx="7" fill="white" stroke="#888" stroke-width="1"/>
  <text class="lbl" x="${lx}" y="${ly + 4.5}" text-anchor="middle" font-size="9"
    font-weight="700" fill="#333" font-family="Arial,sans-serif">${esc(ve.label)}</text>
</g>\n`;
    }
  });

  // Nodes on top
  vns.forEach(vn => {
    const p = pos[vn.id];
    if (!p) return;
    svg += renderNode(vn.type, p.x, p.y, vn.label, vn.srcId, vn.srcType);
  });

  const labelDisplay = showLabels ? '' : ' .lbl{display:none}';
  svg = svg.replace('<style>', `<style>${labelDisplay}`);

  svg += '</svg>';
  return svg;
}

export const generateSystemDiagram = generateSystemDiagramSVG;
