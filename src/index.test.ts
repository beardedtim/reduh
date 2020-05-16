import { view, always } from "ramda";

import { stateToPrimitives } from "./";

describe("Reduh", () => {
  describe("stateToPrimitives", () => {
    it("turns state into lenses, modifiers, updaters, and selectors", () => {
      const defaultState = { a: 1 };

      const { lenses, modifiers, updaters, selectors } = stateToPrimitives(
        defaultState
      );

      expect(view(lenses.a, defaultState)).toBe(defaultState.a);
      expect(modifiers.a((old) => old + 1, defaultState)).toEqual({ a: 2 });
    });
  });
});
