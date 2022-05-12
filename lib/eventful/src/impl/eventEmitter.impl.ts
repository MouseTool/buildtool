import { IEventEmitter } from "../events.interfaces";

type CallbackFunction = (this: void, ...args: any[]) => void;

/**
 * An `IEventEmitter` implementation using arrays.
 */
class EventEmitter implements IEventEmitter {
  static defaultMaxListeners = 20;
  protected maxListeners?: number;
  protected eventListenersArray: Record<
    string | symbol,
    { count: number; listeners: CallbackFunction[] }
  >;

  constructor() {
    this.eventListenersArray = {};
  }

  addListener(eventName: string | symbol, listener: CallbackFunction): this {
    return this.on(eventName, listener);
  }

  /**
   * Adds the `listener` function to the end of the listeners array for the
   * event named `eventName`. No checks are made to see if the `listener` has
   * already been added. Multiple calls passing the same combination of `eventName`and `listener` will result in the `listener` being added, and called, multiple
   * times.
   *
   * ```js
   * server.on('connection', (stream) => {
   *   console.log('someone connected!');
   * });
   * ```
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   *
   * By default, event listeners are invoked in the order they are added. The`emitter.prependListener()` method can be used as an alternative to add the
   * event listener to the beginning of the listeners array.
   *
   * ```js
   * const myEE = new EventEmitter();
   * myEE.on('foo', () => console.log('a'));
   * myEE.prependListener('foo', () => console.log('b'));
   * myEE.emit('foo');
   * // Prints:
   * //   b
   * //   a
   * ```
   */
  on(eventName: string | symbol, listener: CallbackFunction): this {
    const events = this.eventListenersArray;
    if (!events[eventName]) {
      events[eventName] = {
        count: 0,
        listeners: [],
      };
    }

    const event = events[eventName];
    event.listeners[++event.count - 1] = listener;

    if (
      event.count - (this.maxListeners || EventEmitter.defaultMaxListeners) ==
      1
    ) {
      print(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${
          event.count
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
   * `removeListener()` will remove, at most, one instance of a listener from the
   * listener array. If any single listener has been added multiple times to the
   * listener array for the specified `eventName`, then `removeListener()` must be
   * called multiple times to remove each instance.
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
   * When a single function has been added as a handler multiple times for a single
   * event (as in the example below), `removeListener()` will remove the most
   * recently added instance. In the example the `once('ping')`listener is removed:
   *
   * ```js
   * const ee = new EventEmitter();
   *
   * function pong() {
   *   console.log('pong');
   * }
   *
   * ee.on('ping', pong);
   * ee.once('ping', pong);
   * ee.removeListener('ping', pong);
   *
   * ee.emit('ping');
   * ee.emit('ping');
   * ```
   *
   * Returns a reference to the `EventEmitter`, so that calls can be chained.
   */
  removeListener(eventName: string | symbol, listener: CallbackFunction): this {
    const event = this.eventListenersArray[eventName];
    if (!event) return this;

    // According to spec, match the most recently added listener
    for (let i = event.count - 1; i >= 0; i--) {
      if (event.listeners[i] === listener) {
        // ts -> lua
        table.remove(event.listeners, i + 1);
        event.count--;
        if (event.count == 0) {
          this.eventListenersArray[eventName] = undefined;
        }
        return this;
      }
    }
    return this;
  }

  off(eventName: string | symbol, listener: CallbackFunction): this {
    return this.removeListener(eventName, listener);
  }

  removeAllListeners(eventName?: string | symbol): this {
    if (!eventName) {
      for (const [n] of pairs(this.eventListenersArray)) {
        this.eventListenersArray[n] = undefined;
      }
    } else {
      this.eventListenersArray[eventName] = undefined;
    }
    return this;
  }

  setMaxListeners(n: number): this {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners(): number {
    return this.maxListeners || EventEmitter.defaultMaxListeners;
  }

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const event = this.eventListenersArray[eventName];
    if (!event) return false;

    // Do not allow any one of the listeners to break the loop by doing `off()` or `on()`
    const toEmit = [...table.unpack(event.listeners, 1, event.count)];
    for (let listener of toEmit) {
      listener(...args);
    }

    return true;
  }

  listenerCount(eventName: string | symbol): number {
    return this.eventListenersArray[eventName]?.count ?? 0;
  }

  prependListener(
    eventName: string | symbol,
    listener: CallbackFunction
  ): this {
    const events = this.eventListenersArray;
    if (!events[eventName]) {
      events[eventName] = {
        count: 0,
        listeners: [],
      };
    }

    const event = events[eventName];
    ++event.count;
    event.listeners.unshift(listener);

    if (
      event.count - (this.maxListeners || EventEmitter.defaultMaxListeners) ==
      1
    ) {
      print(
        `MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${
          event.count
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
    for (const [n] of pairs(this.eventListenersArray)) {
      names.push(n);
    }
    return names;
  }
}

export { EventEmitter };
