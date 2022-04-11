import DoublyLinkedList from "../../../linkedlist/src/DoublyLinkedList";

type QueueItem = {
  callback: Function;
  args: any[];
  argCount: number;
};

export interface IProcessQueue {
  enqueue(callback: Function, ...args: any);
  drain();
}

export class GeneralProcessQueue implements IProcessQueue {
  private queue: DoublyLinkedList<QueueItem>;

  constructor() {
    this.queue = new DoublyLinkedList<QueueItem>();
  }

  enqueue(callback: Function, ...args: any) {
    this.queue.pushBack({
      callback,
      args,
      argCount: select("#", ...args),
    });
  }

  drain() {
    const queue = this.queue
    while (queue.front()) {

    }
  }
}

// TBD
// type EventQueueItem = QueueItem & {
//     /**
//      * The original timestamp in MS in which the event was fired, causing the callback to be
//      * queued.
//      */
//     queueTime: number;
//   };
