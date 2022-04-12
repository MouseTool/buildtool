import DoublyLinkedList from "../../../linkedlist/src/DoublyLinkedList";
import {
  PhaseTypes,
  ProcessQueueOptions,
  TickStats,
  TickTypes,
} from "../process";
import { GeneralProcessQueue, IProcessQueue } from "./queueOps";

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
  timers: new GeneralProcessQueue(),
  deferredEvents: new GeneralProcessQueue(),
  events: new GeneralProcessQueue(),
  close: new GeneralProcessQueue(),
  postPhase: new GeneralProcessQueue(),
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

const tickQueueSeq: Record<TickTypes, PhaseTypes[]> = {
  loop: ["deferredEvents", "close"],
  event: ["events", "close"],
  timer: ["timers", "close"],
};

export function fireTick(tickType: TickTypes) {
  const seq = tickQueueSeq[tickType];
  if (!seq) {
    error(`Invalid tick type ${tickType}!`);
  }

  currentTickType = tickType;
  let tmp = os.time();
  for (const qType of seq) {
    const iter = queueOps[qType].drain();
    for (const _ of iter) {
      //print(`cb take time: ${os.time() - tmp}`);
    }
    print(`cb take time: ${os.time() - tmp}`);

    // Drain the post-phase queue after each seq
    const postIter = queueOps["postPhase"].drain();
    for (const _ of postIter) {
      //print(`postcb take time: ${os.time() - tmp}`);
    }
    print(`postcb take time: ${os.time() - tmp}`);
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
    currentTickType,
  } as TickStats;
}

/**
 * Sets or retrieves the current process queue options.
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
