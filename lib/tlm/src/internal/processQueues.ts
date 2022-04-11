import DoublyLinkedList from "../../../linkedlist/src/DoublyLinkedList";
import {
  PhaseTypes,
  ProcessQueueOptions,
  TickStats,
  TickTypes,
} from "../process";

export const options: ProcessQueueOptions = {
  cycleDuration: 4000,
  runtimeLimit: 60,
  rationLevelMedium: 60,
  rationLevelCritical: 90,
};

/**
 * Provides information on the current tick.
 */
export const tickStats: TickStats = {};

type QueueItem = {
  callback: Function;
  args: any[];
  argCount: number;
};

type TimerQueueItem = QueueItem;
// & {
//   /**
//    * The minimum time in MS to execute the callback
//    */
//   minTime: number;
// };
const timerQueue = new DoublyLinkedList<TimerQueueItem>();

type EventQueueItem = QueueItem & {
  /**
   * The original timestamp in MS in which the event was fired, causing the callback to be
   * queued.
   */
  queueTime: number;
};

const eventQueue = new DoublyLinkedList<EventQueueItem>();
const deferredEventQueue = new DoublyLinkedList<EventQueueItem>();

type CloseQueueItem = QueueItem;
const closeQueue = new DoublyLinkedList<CloseQueueItem>();

type PostPhaseQueueItem = QueueItem;
const postPhaseQueue = new DoublyLinkedList<PostPhaseQueueItem>();

type QueuableTypes = PhaseTypes| "postPhase";

const queueOps: Record<
  QueuableTypes,
  {
    queue: (item: QueueItem) => void;
    drain: () => void;
  }
> = {
  timers: {
    queue: function (item: QueueItem): void {
      timerQueue.pushBack(item);
    },
    drain: function (): void {
      throw new Error("Function not implemented.");
    },
  },
  events: {
    queue: function (item: QueueItem): void {
      (item as EventQueueItem).queueTime = os.time();
      eventQueue.pushBack(item as EventQueueItem);
    },
    drain: function (): void {
      throw new Error("Function not implemented.");
    },
  },
  close: {
    queue: function (item: QueueItem): void {
      closeQueue.pushBack(item);
    },
    drain: function (): void {
      throw new Error("Function not implemented.");
    },
  },
  postPhase: {
    queue: function (item: QueueItem): void {
      postPhaseQueue.pushBack(item);
    },
    drain: function (): void {

    },
  },
  deferredEvents: {
    queue: function (item: QueueItem): void {
      throw new Error("Function not implemented.");
    },
    drain: function (): void {
      throw new Error("Function not implemented.");
    }
  }
};

/**
 * Queues `callback` to the specified phase's queue `type`. Do not call this unless you know what
 * you're doing!
 */
export function queue(type: QueuableTypes, callback: Function, ...args: any) {
  const item = { callback, args, argCount: select("#", ...args) } as QueueItem;

  if (queueOps[type]) {
    closeQueue.pushBack(item);
  } else {
    error(`Invalid queue type ${type}!`);
  }
}

export function fireTick(tickType: TickTypes) {
  tickStats.currentTick = tickType;

  if (tickType == "event") {
  }
}

/**
 * Calculates the runtime usage within the current 4-seconds cycle.
 */
export function runtimeUsage() {
  return os.time();
}
