import DoublyLinkedList from "../../../linkedlist/src/DoublyLinkedList";
import {
  PhaseTypes,
  ProcessQueueOptions,
  TickStats,
  TickTypes,
} from "../process";
import { IProcessQueue } from "./queueOps";

export const options: ProcessQueueOptions = {
  cycleDuration: 4000,
  runtimeLimit: 60,
  rationLevelMedium: 60,
  rationLevelCritical: 90,
};

// Queue options
let cycleDuration = 4000;
let runtimeLimit = 60;
let rationLevelMedium = 60;
let rationLevelCritical = 90;

// Tick stats
let currentTickType: TickTypes;
let currentPhase: PhaseTypes;
let currentQueuedAt: number;

type QueuableTypes = PhaseTypes | "postPhase";

const queueOps: Record<QueuableTypes, IProcessQueue> = {
  timers: undefined,
  deferredEvents: undefined,
  events: undefined,
  close: undefined,
  postPhase: undefined,
};

/**
 * Queues `callback` to the specified phase's queue `type`. Do not call this unless you know what
 * you're doing!
 */
export function queue(type: QueuableTypes, callback: Function, ...args: any) {
  const queueOp = queueOps[type];
  if (queueOp) {
    queueOp.enqueue(callback, ...args);
  } else {
    error(`Invalid queue type ${type}!`);
  }
}

const tickQueueSeq: Record<TickTypes, QueuableTypes[]> = {
  loop: [],
  event: [],
  timer: [],
};

export function fireTick(tickType: TickTypes) {
  const seq = tickQueueSeq[tickType];
  if (!seq) {
    error(`Invalid tick type ${tickType}!`);
  }

  currentTickType = tickType;
  for (const qType of seq) {
    queueOps[qType].drain();
  }
}

/**
 * Calculates the runtime usage within the current 4-seconds cycle.
 */
export function runtimeUsage() {
  return os.time();
}

/**
 * Provides information on the state of the current event loop.
 */
export function tickStats() {
  return {
    currentPhase,
    currentQueuedAt,
    currentTickType: currentTickType,
  } as TickStats;
}

/**
 * Sets or gets the current process queue options.
 */
export function processQueueOpts(): ProcessQueueOptions;
export function processQueueOpts(options: Partial<ProcessQueueOptions>): void;
export function processQueueOpts(options?: Partial<ProcessQueueOptions>) {
  if (!options) {
    // Getter
    return {
      cycleDuration,
      rationLevelCritical,
      rationLevelMedium,
      runtimeLimit,
    } as ProcessQueueOptions;
  }

  cycleDuration = options.cycleDuration ?? cycleDuration;
  rationLevelCritical = options.rationLevelCritical ?? rationLevelCritical;
  rationLevelMedium = options.rationLevelMedium ?? rationLevelMedium;
  runtimeLimit = options.runtimeLimit ?? runtimeLimit;
}
