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
import { describe, it, given } from "@typed/test";

const TEST_EVENT_VALUE = "test";

const collect = async <A>(n: number, s: Stream<A>): Promise<A[]> => {
  const xs: A[] = [];
  const sa = tap(x => xs.push(x), s);
  await runEffects(take(n, sa), newDefaultScheduler());
  return xs;
};

const range = (start: number, n: number): number[] =>
  Array.from(Array(n), (_, i) => start + i);

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min));

export const indexTests = describe("index", [
  given("a stream", [
    it("replaces events with 0-based index", async ({ equal }) => {
      // Fixture setup
      const s = periodic(1);
      const n = randomInt(10, 20);
      const expectedEvents = range(0, n);
      // Exercise system
      const result = index(s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const withIndexTests = describe("withIndex", [
  given("a stream", [
    it("pairs events with 0-based count", async ({ equal }) => {
      // Fixture setup
      const s = constant(TEST_EVENT_VALUE, periodic(1));
      const n = randomInt(10, 20);
      const expectedEvents = range(0, n).map<[number, string]>(n => [
        n,
        TEST_EVENT_VALUE
      ]);
      // Exercise system
      const result = withIndex(s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const countTests = describe("count", [
  given("a stream", [
    it("replaces events with 1-based count", async ({ equal }) => {
      // Fixture setup
      const s = periodic(1);
      const n = randomInt(10, 20);
      const expectedEvents = range(1, n);
      // Exercise system
      const result = count(s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const withCountTests = describe("withCount", [
  given("a stream", [
    it("pairs events with 1-based count", async ({ equal }) => {
      // Fixture setup
      const s = constant(TEST_EVENT_VALUE, periodic(1));
      const n = randomInt(10, 20);
      const expectedEvents = range(1, n).map<[number, string]>(n => [
        n,
        TEST_EVENT_VALUE
      ]);
      // Exercise system
      const result = withCount(s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const withIndexStartTests = describe("withIndexStart", [
  given("a start index and a stream", [
    it("pairs events with start-based index", async ({ equal }) => {
      // Fixture setup
      const idx = randomInt(0, 10000);
      const s = constant(TEST_EVENT_VALUE, periodic(1));
      const n = randomInt(10, 20);
      const expectedEvents = range(idx, n).map<[number, string]>(n => [
        n,
        TEST_EVENT_VALUE
      ]);
      // Exercise system
      const result = withIndexStart(idx, s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const indexedTests = describe("indexed", [
  given("a function, an initial value, and a stream", [
    it("should pair events with computed index", async ({ equal }) => {
      // Fixture setup
      const n = randomInt(10, 20);
      const arbitraryChar = "a";
      const strOfLenN = Array(n)
        .fill(arbitraryChar)
        .join("");
      const stringIndex = (s: string) => (prev: string): [string, string] => [
        prev,
        prev + s
      ];
      const f = stringIndex(arbitraryChar);
      const init = "";
      const s = constant(TEST_EVENT_VALUE, periodic(1));
      const expectedEvents = range(0, n).map<[string, string]>((_, i) => [
        strOfLenN.slice(0, i),
        TEST_EVENT_VALUE
      ]);
      // Exercise system
      const result = indexed(f, init, s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);

export const keepIndexTests = describe("keepIndex", [
  given("a stream of an [index, value] pair", [
    it("should keep index and discard value", async ({ equal }) => {
      // Fixture setup
      const idx = randomInt(0, 10000);
      const s = withIndexStart(idx, constant(TEST_EVENT_VALUE, periodic(1)));
      const n = randomInt(10, 20);
      const expectedEvents = range(idx, n);
      // Exercise system
      const result = keepIndex(s);
      // Verify outcome
      const actualEvents = await collect(n, result);
      equal(expectedEvents, actualEvents);
    })
  ])
]);
