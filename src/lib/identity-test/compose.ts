import type { ConnectorTexts, ResolvedBeliefContent } from "./types";

/**
 * Deterministiska portretu kompozīcija.
 *
 * Principi (specifikācija §4-5):
 * - Līdzīgi uzskati grupējas pēc kopīgiem mehānismu tagiem (union-find).
 * - Katrs klasteris → viena rindkopa; klasteru iekšienē nav fragmentu atkārtošanās.
 * - Atšķirīgi modeļi netiek sapludināti - starp klasteriem kontrasta pāreja.
 * - Teksts balstās TIKAI uz izvēlēto uzskatu fragmentiem - neizdomā faktus.
 * - Fragmenti ir admin-apstiprināti un jau satur iespējamības valodu.
 */

function normalize(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

function dedupe<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = normalize(key(item));
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

type Cluster = { beliefs: ResolvedBeliefContent[]; mechanismKeys: string[] };

export function clusterBeliefs(beliefs: ResolvedBeliefContent[]): Cluster[] {
  // Union-find pār indeksiem: savieno uzskatus ar kopīgu mehānismu tagu.
  const parent = beliefs.map((_, i) => i);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const union = (a: number, b: number) => { parent[find(a)] = find(b); };

  const tagOwners = new Map<string, number>();
  beliefs.forEach((b, i) => {
    for (const key of b.mechanismKeys) {
      const owner = tagOwners.get(key);
      if (owner === undefined) tagOwners.set(key, i);
      else union(owner, i);
    }
  });

  const groups = new Map<number, ResolvedBeliefContent[]>();
  beliefs.forEach((b, i) => {
    const root = find(i);
    const list = groups.get(root) ?? [];
    list.push(b);
    groups.set(root, list);
  });

  return [...groups.values()]
    .map((list) => ({
      beliefs: list,
      mechanismKeys: [...new Set(list.flatMap((b) => b.mechanismKeys))],
    }))
    .sort((a, b2) => b2.beliefs.length - a.beliefs.length);
}

function joinParagraphs(parts: string[], joiner?: string): string {
  const cleaned = parts.filter(Boolean);
  if (cleaned.length <= 1) return cleaned.join(" ");
  return cleaned.join(` ${joiner ?? ""} `).replace(/\s+/g, " ").trim();
}

function clusterParagraph(
  cluster: Cluster,
  field: "portraitNow" | "portraitFuture",
  connectors: ConnectorTexts,
  isFirst: boolean,
): string {
  const fragments = dedupe(
    cluster.beliefs.map((b) => b[field]),
    (t) => t,
  );
  // joinSimilar tikai pirmajam klasterim - vēlākos jau ievada kontrasta
  // savienotājs, un divi savienotāji pēc kārtas lasās nedabiski.
  if (isFirst && cluster.beliefs.length > 1 && connectors.joinSimilar) {
    return [connectors.joinSimilar, joinParagraphs(fragments)].filter(Boolean).join(" ");
  }
  return joinParagraphs(fragments);
}

export function composePortraits(input: {
  beliefs: ResolvedBeliefContent[];
  connectors: ConnectorTexts;
  safetyBlock?: string;
}): { portraitNow: string; portraitFuture: string; safetyTriggered: boolean } {
  const { beliefs, connectors } = input;
  const clusters = clusterBeliefs(beliefs);

  const nowParagraphs = clusters
    .map((cluster, i) => clusterParagraph(cluster, "portraitNow", connectors, i === 0))
    .filter(Boolean);
  const futureParagraphs = clusters
    .map((cluster, i) => clusterParagraph(cluster, "portraitFuture", connectors, i === 0))
    .filter(Boolean);

  // Kontrasta savienotājs tikai starp klasteru rindkopām - ne starp opening/closing.
  const portraitNow = [
    connectors.opening ?? "",
    joinParagraphs(nowParagraphs, connectors.joinContrast),
    connectors.closing ?? "",
  ].filter(Boolean).join("\n\n");

  const portraitFuture = [
    connectors.transition ?? "",
    joinParagraphs(futureParagraphs, connectors.joinContrast),
    connectors.closingFuture ?? connectors.closing ?? "",
  ].filter(Boolean).join("\n\n");

  const safetyTriggered = beliefs.some((b) => b.safetyFlags.includes("CRISIS"));
  const now = safetyTriggered && input.safetyBlock
    ? `${portraitNow}\n\n${input.safetyBlock}`
    : portraitNow;

  return { portraitNow: now, portraitFuture, safetyTriggered };
}
