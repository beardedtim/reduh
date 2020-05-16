import * as R from "ramda";
import { Dictionary } from "ramda";

export type StateLenses<T extends {}> = {
  [key in keyof T]: R.Lens & StateLenses<T[key]>;
};

export type StateSelectors<T> = {
  [key in keyof T]: (state: T) => unknown & StateSelectors<T[key]>;
};

export type StateUpdaters<T> = {
  [key in keyof T]: (update: unknown, state: T) => T & StateUpdaters<T[key]>;
};

export type StateModifiers<T> = {
  [key in keyof T]: (
    fn: (old: unknown) => unknown,
    state: T
  ) => T & StateModifiers<T[key]>;
};

export const makeLenses = <T>(config: T, baseLens?: R.Lens): StateLenses<T> => {
  const lenses: StateLenses<T> = {} as any;
  for (const [key, value] of Object.entries(config)) {
    const rootLens = R.lensProp(key);

    /**
     * CODE OF INTEREST
     *
     * TL;DR:
     *    This allows us to write the `name` and other
     *    "reserved" keys.
     *
     * We are doing this inside of the more familiar
     * lenses[key] because of implementation details
     * of the JS Engine, specifically that since it
     * treats Functions as objects, we _can_ set keys
     * on that object. However, it has reserved the
     * key `name` so that you can check what a function's
     * name is. We aren't going to allow you to do that
     * but we do want to allow you to have a name key on
     * the state.
     *
     *
     */
    Object.defineProperty(lenses, key, {
      writable: true,
      enumerable: true,
      value: baseLens ? (R.compose(baseLens, rootLens) as R.Lens) : rootLens,
    });

    if (value && typeof value === "object") {
      // @ts-ignore
      const nestedLenses = makeLenses(value, lenses[key]);

      /**
       * CODE OF INTEREST
       *
       * **read code block above**
       */
      Object.defineProperty(lenses, key, {
        writable: true,
        enumerable: true,
        // @ts-ignore
        value: Object.assign(lenses[key], nestedLenses),
      });
    }
  }

  return lenses;
};

/**
 * Given a method and a recursive hash of lenses,
 * this will return a recursive hash of the functions
 * to interact with those lenses.
 */
export const useLensesBy = R.curryN(
  2,
  (
    method: "view" | "set" | "over",
    lenses: Dictionary<R.Lens | { [x: string]: R.Lens }>
  ) => {
    const values: Dictionary<any> = {};

    for (const [key, value] of Object.entries(lenses)) {
      const handler = R[method] as any;

      values[key] = handler(value as R.Lens);
      if (Object.keys(value).length) {
        values[key] = Object.assign(
          values[key],
          useLensesBy(method, value as any)
        );
      }
    }

    return values;
  }
);

type RecursiveDict<T, U> = {
  [key in keyof U]: T & RecursiveDict<T, U[key]>;
};

export const makeSelectors: <T>(
  lenses: T
) => RecursiveDict<(state: any) => any, T> = useLensesBy("view");

export const makeUpdaters: <T>(
  lenses: T
) => RecursiveDict<(update: any, state: any) => any, T> = useLensesBy("set");

export const makeModifiers: <T>(
  lenses: T
) => RecursiveDict<(fn: (a: any) => any, state: any) => any, T> = useLensesBy(
  "over"
);
