import {
  makeLenses,
  makeModifiers,
  makeSelectors,
  makeUpdaters,
  StateLenses,
  StateModifiers,
  StateUpdaters,
  StateSelectors,
} from "./utils";

interface ReduhOutput<T> {
  selectors: StateSelectors<T>;
  lenses: StateLenses<T>;
  updaters: StateUpdaters<T>;
  modifiers: StateModifiers<T>;
}

export const stateToPrimitives = <T extends {}>(
  defaultState: T
): ReduhOutput<T> => {
  /**
   * Step 1: Turn the default state given and resolve each key depth-first,
   * into both Lenses and hashes of Lenses
   */
  const lenses = makeLenses(defaultState);

  /**
   * Step 2: Turn the lenses into selectors, updaters, and modifiers
   */

  /**
   * Selectors:
   *
   *   These are ways to view or select the value from a state object
   *
   * @example
   *
   * const lenses = { a: Lens }
   * const selectors = { a: Selector }
   *
   * const state = { a: 1 }
   *
   * selectors.a(state) // 1
   */
  const selectors = makeSelectors(lenses);

  /**
   * Updaters:
   *
   *   These are ways to update a value in a given state object
   *
   * @example
   *
   * const lenses = { a: Lens }
   * const updaters = { a: Updater }
   *
   * const state = { a: 1 }
   *
   * updaters.a(2, state) // { a: 2}
   */
  const updaters = makeUpdaters(lenses);

  /**
   * Modifiers:
   *
   *  These are ways to use the old value to create the new value in state
   *
   * @example
   *
   * const lenses = { a: Lens }
   * const modifiers = { a: Modifier }
   *
   * const state = { a: 1 }
   *
   * modifiers.a(old => old + 1, state) // { a: 2 }
   */
  const modifiers = makeModifiers(lenses);

  return {
    selectors,
    lenses,
    updaters,
    modifiers,
  };
};
