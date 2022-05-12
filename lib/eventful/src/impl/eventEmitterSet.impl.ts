import { IEventEmitter } from "../events.interfaces";
import { SetWithPrepend } from "../setWithPrepend.impl";

type CallbackFunction = (this: void, ...args: any[]) => void;

/**
 * An `IEventEmitter` implementation using `Set`.
 * `EventEmitterSet` will only allow unique listener objects per `eventName`.
 *
 * It is recommended to be used if you remove listeners, prepend listeners, or use `once()` very
 * often. The difference between this and the default implentation, being that its underlying
 * listeners collection utilises advanced data structures such as linked lists and maps to
 * efficiently find and remove listeners in O(1) time.
 *
 * Because of this, `on()` will only allow the same listener object to be added once, unlike in
 * the default implementation.
 */
class EventEmitterSet implements IEventEmitter {
  static defaultMaxListeners = 20;
  protected maxListeners?: number;
  protected eventListenersSet: Record<
    string | symbol,
    SetWithPrepend<CallbackFunction>
  >;

  constructor() {
    this.eventListenersSet = {};
  }

  addListener(eventName: string | symbol, listener: CallbackFunction): this {
    return this.on(eventName, listener);
  }

  /**
   * Adds the `listener` function to the end of the listeners stack for the event named `eventName`.
   * If the same listener was already added to the `eventName`, subsequent adds will be ignored.
   *
   * ```js
   * const uniqueListener = (stream) => {
   *   console.log('someone connected!');
   * }
   * server.on('connection', uniqueListener);
   * server.on('connection', uniqueListener); // will be ignored
   * ```
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   * ```
   */
  on(eventName: string | symbol, listener: CallbackFunction): this {
    const events = this.eventListenersSet;
    if (!events[eventName]) {
      events[eventName] = new SetWithPrepend();
    }

    const event = events[eventName];
    event.add(listener);

    if (
      event.size - (this.maxListeners || EventEmitterSet.defaultMaxListeners) ==
      1
    ) {
      print(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${
          event.size
        } ${tostring(
          eventName
        )} listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit`
      );
    }

    return this;
  }

  once(eventName: string | symbol, listener: CallbackFunction): this {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.removeListener(eventName, onceListener);
    };
    return this.on(eventName, onceListener);
  }

  /**
   * Removes the specified `listener` from the listener array for the event named`eventName`.
   *
   * ```js
   * const callback = (stream) => {
   *   console.log('someone connected!');
   * };
   * server.on('connection', callback);
   * // ...
   * server.removeListener('connection', callback);
   * ```
   *
   * Once an event is emitted, all listeners attached to it at the
   * time of emitting are called in order. This implies that any`removeListener()` or `removeAllListeners()` calls _after_ emitting and_before_ the last listener finishes execution will
   * not remove them from`emit()` in progress. Subsequent events behave as expected.
   *
   * ```js
   * const myEmitter = new MyEmitter();
   *
   * const callbackA = () => {
   *   console.log('A');
   *   myEmitter.removeListener('event', callbackB);
   * };
   *
   * const callbackB = () => {
   *   console.log('B');
   * };
   *
   * myEmitter.on('event', callbackA);
   *
   * myEmitter.on('event', callbackB);
   *
   * // callbackA removes listener callbackB but it will still be called.
   * // Internal listener array at time of emit [callbackA, callbackB]
   * myEmitter.emit('event');
   * // Prints:
   * //   A
   * //   B
   *
   * // callbackB is now removed.
   * // Internal listener array [callbackA]
   * myEmitter.emit('event');
   * // Prints:
   * //   A
   * ```
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   */
  removeListener(eventName: string | symbol, listener: CallbackFunction): this {
    this.eventListenersSet[eventName]?.delete(listener);
    return this;
  }

  off(eventName: string | symbol, listener: CallbackFunction): this {
    return this.removeListener(eventName, listener);
  }

  removeAllListeners(eventName?: string | symbol): this {
    if (!eventName) {
      for (const [n] of pairs(this.eventListenersSet)) {
        this.eventListenersSet[n] = undefined;
      }
    } else {
      this.eventListenersSet[eventName] = undefined;
    }
    return this;
  }

  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners(): number {
    return this.maxListeners || EventEmitterSet.defaultMaxListeners;
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const event = this.eventListenersSet[eventName];
    if (!event) return false;

    // Do not allow any one of the listeners to break the loop by doing `off()` or `on()`
    const toEmit = [...event.values()];

    for (const listener of toEmit) {
      listener(...args);
    }

    return true;
  }

  listenerCount(eventName: string | symbol): number {
    return this.eventListenersSet[eventName]?.size ?? 0;
  }

  prependListener(
    eventName: string | symbol,
    listener: CallbackFunction
  ): this {
    const events = this.eventListenersSet;
    if (!events[eventName]) {
      events[eventName] = new SetWithPrepend();
    }

    const event = events[eventName];
    event.prepend(listener);

    if (
      event.size - (this.maxListeners || EventEmitterSet.defaultMaxListeners) ==
      1
    ) {
      print(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${
          event.size
        } ${tostring(
          eventName
        )} listeners added to [EventEmitter]. Use emitter.setMaxListeners() to increase limit`
      );
    }

    return this;
  }

  prependOnceListener(
    eventName: string | symbol,
    listener: CallbackFunction
  ): this {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.removeListener(eventName, onceListener);
    };
    return this.prependListener(eventName, onceListener);
  }

  eventNames(): (string | symbol)[] {
    const names = [];
    for (const [n] of pairs(this.eventListenersSet)) {
      names.push(n);
    }
    return names;
  }
}

export { EventEmitterSet };
