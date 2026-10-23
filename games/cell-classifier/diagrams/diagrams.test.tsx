import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { normalizeText } from "@/lib/text";
import { PARTS, getPart, type CellType } from "../data/parts";
import { CellDiagram } from "./CellDiagram";

function extractDataParts(cell: CellType): Set<string> {
  const html = renderToStaticMarkup(<CellDiagram cell={cell} />);
  const matches = html.matchAll(/data-part="([^"]+)"/g);
  return new Set(Array.from(matches, (m) => m[1]));
}

describe("Cell Classifier diagrams and parts catalog integrity", () => {
  const cellTypes: readonly CellType[] = ["animal", "plant", "bacteria"];

  it("includes every part's data-part in each diagram listed in its cells array, and no unknown data-parts", () => {
    const knownPartIds = new Set(PARTS.map((p) => p.id));
    const renderedByCell: Record<CellType, Set<string>> = {
      animal: extractDataParts("animal"),
      plant: extractDataParts("plant"),
      bacteria: extractDataParts("bacteria"),
    };

    for (const cell of cellTypes) {
      for (const foundId of renderedByCell[cell]) {
        expect(
          knownPartIds.has(foundId),
          `${cell} diagram has unknown data-part="${foundId}"`,
        ).toBe(true);
        const part = getPart(foundId);
        expect(
          part.cells.includes(cell),
          `data-part="${foundId}" is rendered in ${cell} diagram but ${cell} is not in part.cells`,
        ).toBe(true);
      }
    }

    for (const part of PARTS) {
      for (const cell of part.cells) {
        expect(
          renderedByCell[cell].has(part.id),
          `part "${part.id}" lists "${cell}" in cells, but <g data-part="${part.id}"> is missing in ${cell} diagram`,
        ).toBe(true);
      }
    }
  });

  it("has unique normalized names and aliases across all parts", () => {
    const seen = new Map<string, string>();
    for (const part of PARTS) {
      const normName = normalizeText(part.name);
      expect(seen.has(normName), `duplicate name ${part.name}`).toBe(false);
      seen.set(normName, part.id);

      for (const alias of part.aliases) {
        const normAlias = normalizeText(alias);
        const owner = seen.get(normAlias);
        if (owner && owner !== part.id) {
          throw new Error(
            `alias "${alias}" on ${part.id} collides with ${owner}`,
          );
        }
        seen.set(normAlias, part.id);
      }
    }
  });

  it("keeps every fn description <= 110 characters and preserves the powerhouse meme", () => {
    for (const part of PARTS) {
      expect(
        part.fn.length,
        `${part.id}.fn is ${part.fn.length} chars (max 110): "${part.fn}"`,
      ).toBeLessThanOrEqual(110);
    }
    expect(getPart("mitochondrion").fn).toBe(
      "Produces most of the cell's ATP through cellular respiration: the powerhouse of the cell ⚡",
    );
  });
});

