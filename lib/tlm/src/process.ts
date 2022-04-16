/** @noSelfInFile */

import launchTime from "./internal/launchTime";
import {
  defer,
  queue,
  runtimeCycleStats,
  tickStats,
} from "./internal/processQueues";
import { CallbackFunction } from "./internal/queueOps";
import { TlmPromise } from "./promise";

/*
Acknowledegment: A bulk of the architecture and documentation was borrowed from NodeJS.

**Major process phases in a tick**
1. timers
2. deferrables
  - Callbacks that were deferred to the next loop iteration(s)
3. events
4. close
  - Callbacks executed in the closing of a tick. This can be used to destroy objects, dereference
  variables, etc.

Each phase has its own dedicated queue. After draining its queue, the `postPhase` queue is drained
completely.

There are different tick types that may execute queues in specific orders (some queues may not
drain at all). The following documents the default behavior, which may be configured otherwise
(TBC).

**What happens during "loop" type tick**
A loop tick can be fired due to a TFM `eventLoop` callback. It will drain queues in the following
order:
1. deferrables
2. close

**What happens during "event" type tick**
An event tick can be fired due to a TFM `event%s` callback. It will drain queues in the following
order:
1. events
2. close

**What happens during "timer" type tick**
A timer tick can be fired off due to a `system.newTimer` callback, or directly after an event tick
during an `eventLoop` callback.
1. timers
2. close
 */

export type TickTypes = "loop" | "event" | "timer";
export type PhaseTypes = "timers" | "deferrables" | "events" | "close";

/**
 * Provides information on the current tick.
 */
export interface TickStats {
  currentTickType?: TickTypes;
  currentPhase?: PhaseTypes;
  /**
   * The time in milliseconds that the event callback was originally queued at.
   *
   * Available during the "deferred events" and "event callbacks" phase.
   */
  currentQueuedAt?: number;
}

/**
 * Provides information on the current runtime information within the current 4-seconds cycle.
 */
export interface RuntimeCycleStats {
  cycleId: number;
  /**
   * The runtime usage (ms).
   */
  cycleRuntimeUse: number;
  /**
   * Calculates the ration pressure level (%), denoting how aggressive runtime savings should be.
   */
  calculateRationPressure: (this: void) => number;
}

export type ProcessQueueOptions = {
  /**
   * The duration of one cycle for the `runtimeLimit`.
   */
  cycleDuration: number;
  /**
   * The runtime limit, in seconds.
   */
  runtimeLimit: number;
  /**
   * Defines the "medium" threshold of runtime usage.
   *
   * During this stage, non-essential callbacks should defer execution to the next ticks.
   */
  rationLevelMedium: number;
  /**
   * Defines the "crtical" threshold of runtime usage.
   *
   * During this stage, all ticks will be ignored.
   */
  rationLevelCritical: number;
};

/**
 * Queues `callback` to the "post phase queue" after the current phase ends. This queue is drained
 * after the current major phase queue is drained.
 *
 * It is similar to Node's `process.nextTick`, but has been named differently to better reflect its
 * use.
 */
export function postPhase(callback: CallbackFunction, ...args: any[]) {
  queue("postPhase", callback, ...args);
}

/**
 * Re-promisifies a TSTL `Promise` function so that it will conform to the rules of the TLM event
 * loop, and only attempts to execute when a resolve handler exists.
 */
export function reasync<TArgs extends any[], TReturn>(
  promiseFnc: (this: void, ...args: TArgs) => Promise<TReturn>
) {
  return (...args: TArgs) => {
    return TlmPromise.wrap(promiseFnc(...args));
  };
}

export { tickStats, runtimeCycleStats, defer, launchTime };
