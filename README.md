# reduh

> Using Lenses to simplify state management

# HEAVY WIP

## Overview

The goal of this package is to simplify how we deal with state between server
and client using the tools we have available today.

## API

#### stateToPrimitives

This is responsible for taking in some shape and returning the primitives
needed for the rest of the system to work correctly

```typescript
import { stateToPrimitives } from '@beardedtim/reduh'

// Whatever shape you expect it to be
const dummyState = {
  user: {
    first_name: 'tim',
    last_name: 'roberts',
    age: 31,
    location: {
      city: 'Knoxville',
      state: 'TN'
    }
  },
}

const {
  lenses,
  modifiers,
  updaters,
  selectors
} = stateToPrimitives(dummyState)

/**
 * Selectors are equivalent to
 * R.view(lenses.key, state)
 * 
 * so
 * 
 * selectors.user(dummyState) is equivalent to
 * R.view(lenses.user, dummyState)
 * 
 * and
 * 
 * selectors.user.location.city(dummyState) is equivalent to
 * R.view(lenses.user.location.city, dummyState) and you are
 * encouraged to use them how you see fit
 */
selectors.user(dummyState) // { first_name: '...', ... }
selectors.user.first_name(dummyState) // 'tim'
selectors.user.location.city(dummyState) // 'Knoxville'

updaters.user.first_name('John', dummyState) // { user: { first_name: 'John', ... } }
updaters.user.age(32, dummyState) // { user: { age: 32, ... } }

modifiers.user.first_name(oldName => oldName.toUpperCase(), dummyState) // { user: { first_name: 'TIM', ... } }
```