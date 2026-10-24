import { describe, it, expect } from "vitest";

// --- Pure idle economy helpers (extracted from MainScene for testability) ---

function passiveIncome(fishCount: number, tankLevel: number): number {
  return fishCount * tankLevel;
}

function buyFish(coins: number, fishCount: number): { coins: number; fishCount: number; ok: boolean } {
  const COST = 12;
  if (coins < COST) return { coins, fishCount, ok: false };
  return { coins: coins - COST, fishCount: fishCount + 1, ok: true };
}

function upgradeFeeder(coins: number, tankLevel: number): { coins: number; tankLevel: number; ok: boolean } {
  const COST = 5;
  if (coins < COST) return { coins, tankLevel, ok: false };
  return { coins: coins - COST, tankLevel: tankLevel + 1, ok: true };
}

function sponsorFish(coins: number, fishCount: number, sponsorReady: boolean): {
  coins: number;
  fishCount: number;
  sponsorReady: boolean;
} {
  if (!sponsorReady) return { coins, fishCount, sponsorReady };
  return { coins: coins + 25, fishCount: fishCount + 1, sponsorReady: false };
}

function hudText(coins: number, fishCount: number, tankLevel: number): string {
  return `🪙 ${coins} · 🐟 ${fishCount} · tank lv ${tankLevel} · +${passiveIncome(fishCount, tankLevel)}/s`;
}

// --- Tests ---

describe("passiveIncome", () => {
  it("starts at fish × tankLevel", () => {
    expect(passiveIncome(1, 1)).toBe(1);
    expect(passiveIncome(3, 2)).toBe(6);
    expect(passiveIncome(5, 4)).toBe(20);
  });
});

describe("buyFish", () => {
  it("purchases fish when coins >= 12", () => {
    const result = buyFish(20, 1);
    expect(result.ok).toBe(true);
    expect(result.coins).toBe(8);
    expect(result.fishCount).toBe(2);
  });

  it("rejects purchase when insufficient coins", () => {
    const result = buyFish(5, 1);
    expect(result.ok).toBe(false);
    expect(result.coins).toBe(5);
    expect(result.fishCount).toBe(1);
  });

  it("succeeds at exact cost boundary", () => {
    const result = buyFish(12, 1);
    expect(result.ok).toBe(true);
    expect(result.coins).toBe(0);
  });
});

describe("upgradeFeeder", () => {
  it("upgrades tank when coins >= 5", () => {
    const result = upgradeFeeder(10, 1);
    expect(result.ok).toBe(true);
    expect(result.coins).toBe(5);
    expect(result.tankLevel).toBe(2);
  });

  it("rejects upgrade when insufficient coins", () => {
    const result = upgradeFeeder(3, 1);
    expect(result.ok).toBe(false);
    expect(result.tankLevel).toBe(1);
  });
});

describe("sponsorFish", () => {
  it("grants coins and fish when sponsor ready", () => {
    const result = sponsorFish(0, 1, true);
    expect(result.coins).toBe(25);
    expect(result.fishCount).toBe(2);
    expect(result.sponsorReady).toBe(false);
  });

  it("does nothing when sponsor not ready", () => {
    const result = sponsorFish(0, 1, false);
    expect(result.coins).toBe(0);
    expect(result.fishCount).toBe(1);
    expect(result.sponsorReady).toBe(false);
  });
});

describe("hudText", () => {
  it("includes all key metrics", () => {
    const text = hudText(42, 3, 2);
    expect(text).toContain("42");
    expect(text).toContain("3");
    expect(text).toContain("tank lv 2");
    expect(text).toContain("+6/s");
  });
});
