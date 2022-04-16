import DoublyLinkedList from "../../../linkedlist/src/DoublyLinkedList";

const unpack = table.unpack;
const osTime = os.time;

export type CallbackFunction = (this: void, ...args: any[]) => void;

type QueueItem = {
  callback: CallbackFunction;
  args: any[];
  argCount: number;
};

export interface IProcessQueue {
  enqueue(callback: CallbackFunction, ...args: any): void;
  /**
   * @returns `true` if a callback was completed, `false` if there are no more callbacks to fulfil.
   */
  dequeue(): boolean;
}

export class GeneralProcessQueue implements IProcessQueue {
  private queue: DoublyLinkedList<QueueItem>;

  constructor() {
    this.queue = new DoublyLinkedList<QueueItem>();
  }

  enqueue(callback: CallbackFunction, ...args: any) {
    this.queue.pushBack({
      callback,
      args,
      argCount: select("#", ...args),
    });
  }

  dequeue() {
    const queue = this.queue;
    const front = queue.popFront();
    if (!front) {
      return false;
    }
    const { callback, args, argCount } = front;
    callback(...unpack(args, argCount));
    return true;
  }
}

type EventQueueItem = QueueItem & {
  /**
   * The original timestamp in MS in which the event was fired, causing the callback to be
   * queued.
   */
  queueTime: number;
};

/**
 * Note: This is a non-const var, please obtain it by reference from the module!
 * The time in milliseconds that the event callback was originally queued at.
 *
 * Available during the "deferred events" and "event callbacks" phase.
 */
let currentQueuedAt: number;
export function getCurrentQueuedAt() {
  return currentQueuedAt;
}

export class EventProcessQueue implements IProcessQueue {
  private queue: DoublyLinkedList<EventQueueItem>;

  constructor() {
    this.queue = new DoublyLinkedList<EventQueueItem>();
  }

  enqueue(callback: CallbackFunction, ...args: any) {
    this.queue.pushBack({
      callback,
      args,
      argCount: select("#", ...args),
      queueTime: osTime(),
    });
  }

  dequeue() {
    const queue = this.queue;
    const front = queue.popFront();
    if (!front) {
      return false;
    }
    const { callback, args, argCount, queueTime } = front;
    currentQueuedAt = queueTime;
    callback(...unpack(args, argCount));
    return true;
  }
}
