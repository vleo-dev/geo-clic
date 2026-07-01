// lib/mapColoring.ts

const MAX_ATTEMPTS = 25;

// Greedy graph coloring (Welsh-Powell order) with random tie-breaking.
// Retries a few times and keeps the best (fewest-conflict) attempt, since a
// single greedy pass over a randomized order can occasionally paint itself
// into a corner even though the underlying map is always colorable with a
// handful of colors (four-color theorem).
export function assignMapColors(
  adjacency: number[][],
  colorCount: number,
): number[] {
  const n = adjacency.length;
  const order = [...Array(n).keys()].sort(
    (a, b) => adjacency[b].length - adjacency[a].length,
  );

  let best: number[] | null = null;
  let bestConflicts = Infinity;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const colors = new Array<number>(n).fill(-1);
    let conflicts = 0;

    for (const i of order) {
      const usedByNeighbors = new Set(
        adjacency[i].map((j) => colors[j]).filter((c) => c !== -1),
      );
      const available: number[] = [];
      for (let c = 0; c < colorCount; c++) {
        if (!usedByNeighbors.has(c)) available.push(c);
      }

      if (available.length > 0) {
        colors[i] = available[Math.floor(Math.random() * available.length)];
        continue;
      }

      const counts = new Array(colorCount).fill(0);
      adjacency[i].forEach((j) => {
        if (colors[j] !== -1) counts[colors[j]]++;
      });
      let minCount = Infinity;
      let choice = 0;
      counts.forEach((count, c) => {
        if (count < minCount) {
          minCount = count;
          choice = c;
        }
      });
      colors[i] = choice;
      conflicts++;
    }

    if (conflicts === 0) return colors;
    if (conflicts < bestConflicts) {
      bestConflicts = conflicts;
      best = colors;
    }
  }

  return best ?? new Array(n).fill(0);
}
