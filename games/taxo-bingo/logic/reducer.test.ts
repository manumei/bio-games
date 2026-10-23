import { describe, expect, it } from "vitest";
import { organismsInTaxon } from "@/data/organisms";
import { currentOrganismId } from "@/games/taxo-bingo/logic/deck";
import {
  createInitialTaxoState,
  taxoReducer,
} from "@/games/taxo-bingo/logic/reducer";
import { createRng } from "@/lib/rng";

describe("games/taxo-bingo/logic/reducer", () => {
  it("enforces the hard-mode 120s timer rule in SET_OPTIONS", () => {
    let state = createInitialTaxoState();
    expect(state.options).toEqual({ timer: 180, hardMode: false });

    state = taxoReducer(state, { type: "SET_OPTIONS", hardMode: true });
    expect(state.options).toEqual({ timer: 120, hardMode: true });

    // Attempting to change timer while hardMode is true keeps 120
    state = taxoReducer(state, { type: "SET_OPTIONS", timer: null });
    expect(state.options.timer).toBe(120);
  });

  it("starts the timer only on NEXT_READY and transitions on misplace, give-up, timeout, and win at 12", () => {
    const rng = createRng(777);
    let state = createInitialTaxoState();
    state = taxoReducer(state, { type: "START", rng });

    expect(state.phase).toBe("playing");
    expect(state.deadline).toBeNull();
    expect(state.grid).toHaveLength(12);

    // Timer starts when first image is ready
    const startMs = 1_000_000;
    state = taxoReducer(state, { type: "NEXT_READY", now: startMs });
    expect(state.isImageReady).toBe(true);
    expect(state.deadline).toBe(startMs + 180_000);

    // Find a cell that does NOT match current organism -> misplace does not fill cell
    const firstOrgId = currentOrganismId(state.deck)!;
    const wrongCell = state.grid.find(
      (taxonId) =>
        !organismsInTaxon(taxonId).some((o) => o.id === firstOrgId)
    )!;
    state = taxoReducer(state, { type: "PLACE", taxonId: wrongCell, rng });
    expect(state.filled[wrongCell]).toBeUndefined();
    expect(state.misplacedCell?.taxonId).toBe(wrongCell);
    expect(state.misplacedCell?.nonce).toBe(1);

    // Re-clicking the same wrong cell increments nonce so shake restarts
    state = taxoReducer(state, { type: "PLACE", taxonId: wrongCell, rng });
    expect(state.misplacedCell?.nonce).toBe(2);

    // Give up -> loss modal
    const gaveUp = taxoReducer(state, { type: "GIVE_UP" });
    expect(gaveUp.phase).toBe("over");
    expect(gaveUp.endReason).toBe("gave-up");
    expect(gaveUp.modalOpen).toBe(true);
    expect(taxoReducer(gaveUp, { type: "CLOSE_MODAL" }).modalOpen).toBe(false);

    // Timeout -> loss modal
    const timedOut = taxoReducer(state, { type: "TICK_EXPIRED" });
    expect(timedOut.phase).toBe("over");
    expect(timedOut.endReason).toBe("timeout");
    expect(timedOut.modalOpen).toBe(true);
  });

  it("wins when all 12 cells are filled", () => {
    const rng = createRng(888);
    let state = taxoReducer(createInitialTaxoState(), { type: "START", rng });

    // Construct a deck with 12 organisms matching each of the 12 grid categories in order
    const matchingIds = state.grid.map(
      (taxonId) => organismsInTaxon(taxonId)[0]!.id
    );
    state = {
      ...state,
      deck: { ids: matchingIds, cursor: 0 },
    };

    for (let i = 0; i < state.grid.length; i++) {
      const taxonId = state.grid[i]!;
      state = taxoReducer(state, { type: "NEXT_READY", now: 1000 + i * 100 });
      state = taxoReducer(state, { type: "PLACE", taxonId, rng });
    }

    expect(Object.keys(state.filled)).toHaveLength(12);
    expect(state.phase).toBe("over");
    expect(state.endReason).toBe("won");
    expect(state.modalOpen).toBe(true);
    expect(state.deadline).toBeNull();
  });
});
