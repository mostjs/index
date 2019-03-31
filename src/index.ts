import { loop, map } from '@most/core'
import { Stream } from '@most/types'

// Replace event values with a 1-based count.
export const count = <A>(sa: Stream<A>): Stream<number> =>
  keepIndex(withCount(sa))

// Pair event values with their associated 1-based count.
export const withCount = <A>(sa: Stream<A>): Stream<[number, A]> =>
  withIndexStart(1, sa)

// Replace event values with a 0-based index.
export const index = <A>(sa: Stream<A>): Stream<number> =>
  keepIndex(withIndex(sa))

// Pair event values with their associated 0-based index.
export const withIndex = <A>(sa: Stream<A>): Stream<[number, A]> =>
  withIndexStart(0, sa)

// Pair event values with their associated `start`-based index.
export const withIndexStart = <A>(start: number, sa: Stream<A>): Stream<[number, A]> =>
  indexed(i => [i, i + 1], start, sa)

// Pair event values with an iterative index
export const indexed = <S, I, A>(f: (s: S) => [I, S], init: S, sa: Stream<A>): Stream<[I, A]> =>
  loop((s, a) => {
    const [index, seed] = f(s)
    return { seed, value: [index, a] }
  }, init, sa)

// Given an indexed Stream, keep only the index and discard the event values.
export const keepIndex = <I>(s: Stream<[I, unknown]>): Stream<I> =>
  map(ia => ia[0], s)
