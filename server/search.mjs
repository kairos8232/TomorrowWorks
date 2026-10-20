// Nearest-skill search over the ESCO skill vectors from the RunPod GPU run (Job A).
// Pure functions plus a loader; no network. Tested in src/search.test.ts.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Convert one IEEE 754 half-precision number (16 bits) to a JS number. */
export function halfToFloat(h) {
  const sign = h & 0x8000 ? -1 : 1;
  const exp = (h >> 10) & 0x1f;
  const frac = h & 0x3ff;
  if (exp === 0) return sign * 2 ** -14 * (frac / 1024);
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * 2 ** (exp - 15) * (1 + frac / 1024);
}

/** Read a 2-D little-endian float16 .npy file (as written by numpy.save) into a Float32Array. */
export function readNpyFloat16(buffer) {
  if (buffer.readUInt8(0) !== 0x93 || buffer.toString('latin1', 1, 6) !== 'NUMPY') throw new Error('Not a .npy file');
  const major = buffer.readUInt8(6);
  const headerLen = major === 1 ? buffer.readUInt16LE(8) : buffer.readUInt32LE(8);
  const headerStart = major === 1 ? 10 : 12;
  const header = buffer.toString('latin1', headerStart, headerStart + headerLen);
  if (!header.includes("'descr': '<f2'")) throw new Error(`Expected float16 data, got header ${header}`);
  if (header.includes("'fortran_order': True")) throw new Error('Fortran order is not supported');
  const [rows, cols] = header.match(/'shape': \((\d+), (\d+)\)/).slice(1).map(Number);
  const offset = headerStart + headerLen;
  const out = new Float32Array(rows * cols);
  for (let i = 0; i < out.length; i++) out[i] = halfToFloat(buffer.readUInt16LE(offset + i * 2));
  return { rows, cols, data: out };
}

/** Load vectors and the index, keeping the first row for each ESCO URI (ESCO's CSV repeats 21 skills). */
export function loadSkillIndex(dir) {
  const { rows, cols, data } = readNpyFloat16(readFileSync(join(dir, 'esco-skill-vectors.f16.npy')));
  const items = JSON.parse(readFileSync(join(dir, 'esco-skill-index.json'), 'utf8'));
  const run = JSON.parse(readFileSync(join(dir, 'run-info.json'), 'utf8'));
  if (items.length !== rows) throw new Error(`Index has ${items.length} rows, vectors have ${rows}`);
  const seen = new Set();
  const keep = [];
  items.forEach((item, i) => { if (!seen.has(item.uri)) { seen.add(item.uri); keep.push(i); } });
  const vectors = new Float32Array(keep.length * cols);
  keep.forEach((row, j) => vectors.set(data.subarray(row * cols, (row + 1) * cols), j * cols));
  return { dim: cols, vectors, items: keep.map((i) => items[i]), model: run.model };
}

/** Scale a vector to length 1 so a dot product is the cosine similarity. */
export function normalise(vec) {
  let norm = 0;
  for (const x of vec) norm += x * x;
  norm = Math.sqrt(norm) || 1;
  return Float32Array.from(vec, (x) => x / norm);
}

/** Top-k ESCO skills by cosine similarity to the query vector, at or above minSimilarity. */
export function nearestSkills(index, queryVector, k = 10, minSimilarity = 0.5) {
  if (queryVector.length !== index.dim) throw new Error(`Query has ${queryVector.length} dimensions, index has ${index.dim}`);
  const q = normalise(queryVector);
  const scores = new Float32Array(index.items.length);
  for (let r = 0; r < index.items.length; r++) {
    let dot = 0;
    const base = r * index.dim;
    for (let c = 0; c < index.dim; c++) dot += index.vectors[base + c] * q[c];
    scores[r] = dot;
  }
  return [...scores.keys()]
    .sort((a, b) => scores[b] - scores[a])
    .slice(0, k)
    .filter((r) => scores[r] >= minSimilarity)
    .map((r) => ({ ...index.items[r], similarity: Math.round(scores[r] * 1000) / 1000 }));
}
