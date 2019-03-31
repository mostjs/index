import {
  count,
  index,
  indexed,
  keepIndex,
  withCount,
  withIndex,
  withIndexStart
} from "./index";
import { constant, periodic, runEffects, take, tap } from "@most/core";
import { newDefaultScheduler } from "@most/scheduler";
import { Stream } from "@most/types";
import { describe, it } from "@typed/test";

const collect = async <A>(n: number, s: Stream<A>): Promise<A[]> => {
  const eventValues: A[] = [];
  const collectStream = tap(x => eventValues.push(x), s);
  await runEffects(take(n, collectStream), newDefaultScheduler());
  return eventValues;
};

const range = (start: number, n: number): number[] =>
  Array.from(Array(n), (_, i) => start + i);

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min));

export const indexTests = describe("index", [
  it("replaces events with 0-based index", async ({ equal }) => {
    const n = randomInt(10, 20);
    const events = await collect(n, index(periodic(1)));
    equal(range(0, n), events);
  })
]);

export const withIndexTests = describe("withIndex", [
  it("pairs events with 0-based count", async ({ equal }) => {
    const n = randomInt(10, 20);
    const events = await collect(n, withIndex(constant("test", periodic(1))));
    equal(range(0, n).map(x => [x, "test"]), events);
  })
]);

export const countTests = describe("count", [
  it("replaces events with 1-based count", async ({ equal }) => {
    const n = randomInt(10, 20);
    const events = await collect(n, count(periodic(1)));
    equal(range(1, n), events);
  })
]);

export const withCountTests = describe("withCount", [
  it("pairs events with 1-based count", async ({ equal }) => {
    const n = randomInt(10, 20);
    const events = await collect(n, withCount(constant("test", periodic(1))));
    equal(range(1, n).map(x => [x, "test"]), events);
  })
]);

export const withIndexStartTests = describe("withIndexStart", [
  it("pairs events with start-based index", async ({ equal }) => {
    const start = randomInt(0, 10000);
    const n = randomInt(10, 20);
    const events = await collect(
      n,
      withIndexStart(start, constant("test", periodic(1)))
    );
    equal(range(start, n).map(x => [x, "test"]), events);
  })
]);

export const indexedTests = describe("indexed", [
  it("pairs events with computed index", async ({ equal }) => {
    const n = randomInt(10, 20);

    const s = Array(n)
      .fill("a")
      .join("");
    const expected = range(0, n).map((_, i) => [s.slice(0, i), "test"]);

    const stringIndex = (s: string) => (prev: string): [string, string] => [
      prev,
      prev + s
    ];

    const events = await collect(
      n,
      indexed(stringIndex("a"), "", constant("test", periodic(1)))
    );
    equal(expected, events);
  })
]);

export const keepIndexTests = describe("keepIndex", [
  it("keeps index and discards value", async ({ equal }) => {
    const start = randomInt(0, 10000);
    const n = randomInt(10, 20);
    const events = await collect(
      n,
      keepIndex(withIndexStart(start, constant("test", periodic(1))))
    );
    equal(range(start, n), events);
  })
]);
