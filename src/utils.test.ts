import { view, always } from "ramda";

import {
  makeSelectors,
  makeLenses,
  makeUpdaters,
  makeModifiers,
} from "./utils";

describe("Reduh", () => {
  describe("Internal Helpers", () => {
    describe("makeLenses", () => {
      it("returns an object with the same keys as the passed in object", () => {
        const a = {
          a: 1,
          b: 2,
          c: 3,
        };

        const actual = Object.keys(makeLenses(a));
        const expected = ["a", "b", "c"];

        expect(actual).toEqual(expected);
      });

      it("returns an object that has Lenses as values", () => {
        const t = {
          a: 1,
          b: 2,
          c: 3,
        };

        const lenses = makeLenses(t);

        expect(view(lenses.a, t)).toBe(t.a);
        expect(view(lenses.b, t)).toBe(t.b);
        expect(view(lenses.c, t)).toBe(t.c);
      });

      it("works for nested objects", () => {
        const t = {
          a: {
            b: {
              c: 1,
            },
          },
        };

        const lenses = makeLenses(t);
        expect(view(lenses.a, t)).toBe(t.a);
        expect(view(lenses.a.b, t)).toBe(t.a.b);
        expect(view(lenses.a.b.c, t)).toBe(t.a.b.c);
      });
    });
    describe("makeSelectors", () => {
      it("returns an object with the same keys as the passed in object", () => {
        const a = {
          a: 1,
          b: 2,
          c: 3,
        };
        const lenses = makeLenses(a);
        const actual = Object.keys(lenses);
        const expected = ["a", "b", "c"];

        expect(actual).toEqual(expected);
      });

      it("returns an object that has functions of T => Value", () => {
        const t = {
          a: 1,
          b: 2,
          c: 3,
        };
        const lenses = makeLenses(t);
        const selectors = makeSelectors(lenses);

        expect(selectors.a(t)).toBe(t.a);
        expect(selectors.b(t)).toBe(t.b);
        expect(selectors.c(t)).toBe(t.c);
      });

      it("works on nested objects", () => {
        const t = {
          a: {
            b: {
              c: 1,
            },
          },
        };

        const lenses = makeLenses(t);
        const selectors = makeSelectors(lenses);

        expect(selectors.a(t)).toBe(t.a);
        expect(selectors.a.b(t)).toBe(t.a.b);
        expect(selectors.a.b.c(t)).toBe(t.a.b.c);
      });
    });

    describe("makeUpdaters", () => {
      it("returns an object with the same keys as the passed in object", () => {
        const a = {
          a: 1,
          b: 2,
          c: 3,
        };

        const lenses = makeLenses(a);
        const updaters = makeUpdaters(lenses);
        const actual = Object.keys(updaters);
        const expected = ["a", "b", "c"];

        expect(actual).toEqual(expected);
      });

      it("returns an object that has updater functions as values", () => {
        const t = {
          a: 1,
          b: 2,
          c: 3,
        };

        const lenses = makeLenses(t);
        const updaters = makeUpdaters(lenses);

        // Updaters update a value
        expect(updaters.a(2, t)).toEqual({ ...t, a: 2 });
        expect(updaters.b(3, t)).toEqual({ ...t, b: 3 });
        expect(updaters.c(4, t)).toEqual({ ...t, c: 4 });

        // but they do not mutate the input value
        expect(t).toEqual({ a: 1, b: 2, c: 3 });
      });

      it("works for nested objects", () => {
        const t = {
          a: {
            b: {
              c: 1,
            },
          },
        };

        const lenses = makeLenses(t);
        const updaters = makeUpdaters(lenses);

        /**
         * All expectations are building this shape
         */
        const expectedUpdatedValue = {
          a: {
            b: {
              c: 2,
            },
          },
        };

        expect(updaters.a({ b: { c: 2 } }, t)).toEqual(expectedUpdatedValue);
        expect(updaters.a.b({ c: 2 }, t)).toEqual(expectedUpdatedValue);
        expect(updaters.a.b.c(2, t)).toEqual(expectedUpdatedValue);
      });
    });

    describe("makeModifiers", () => {
      it("returns an object with the same keys as the passed in object", () => {
        const a = {
          a: 1,
          b: 2,
          c: 3,
        };

        const lenses = makeLenses(a);
        const modifiers = makeModifiers(lenses);
        const actual = Object.keys(modifiers);
        const expected = ["a", "b", "c"];

        expect(actual).toEqual(expected);
      });

      it("returns an object that has updater functions as values", () => {
        const t = {
          a: 1,
          b: 2,
          c: 3,
        };

        const lenses = makeLenses(t);
        const modifiers = makeModifiers(lenses);

        // modifies update a value
        expect(modifiers.a(always(2), t)).toEqual({ ...t, a: 2 });
        expect(modifiers.b(always(3), t)).toEqual({ ...t, b: 3 });
        expect(modifiers.c(always(4), t)).toEqual({ ...t, c: 4 });

        // but they do not mutate the input value
        expect(t).toEqual({ a: 1, b: 2, c: 3 });
      });

      it("works for nested objects", () => {
        const t = {
          a: {
            b: {
              c: 1,
            },
          },
        };

        const lenses = makeLenses(t);
        const modifiers = makeModifiers(lenses);

        /**
         * All expectations are building this shape
         */
        const expectedUpdatedValue = {
          a: {
            b: {
              c: 2,
            },
          },
        };

        expect(modifiers.a(always({ b: { c: 2 } }), t)).toEqual(
          expectedUpdatedValue
        );
        expect(modifiers.a.b(always({ c: 2 }), t)).toEqual(
          expectedUpdatedValue
        );
        expect(modifiers.a.b.c(always(2), t)).toEqual(expectedUpdatedValue);
      });

      describe("Modifiers", () => {
        it("gets given the current value and returns the next value", () => {
          const state = {
            a: 1,
          };

          const lenses = makeLenses(state);
          const modifiers = makeModifiers(lenses);

          const modify = jest.fn().mockReturnValue(2);

          // We expect that we have modified the state correctly
          expect(modifiers.a(modify, state)).toEqual({ a: 2 });

          // but that we also called modify correctly
          expect(modify).toHaveBeenCalledWith(1);
        });
      });
    });
  });
});
