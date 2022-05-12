/** @noSelfInFile */
/**
 * An event emitter interface mostly based off ECMAScript and Node, with a few notable differences in spec:
 * - Does not dictate the data structure used in the implementation
 * - `on`, `addListener` and their "once" variants do not define if `eventName`-`listener` pairs may not be unique
 * - `listeners` and `rawListeners` removed
 */
export interface IEventEmitter {
    /**
     * Alias for `emitter.on(eventName, listener)`.
     */
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Adds the `listener` function to the end of the listener stack for the
     * event named `eventName`.
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
     * @param eventName The name of the event.
     * @param listener The callback function
     */
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Adds a **one-time**`listener` function for the event named `eventName`. The
     * next time `eventName` is triggered, this listener is removed and then invoked.
     *
     * ```js
     * server.once('connection', (stream) => {
     *   console.log('Ah, we have our first user!');
     * });
     * ```
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     *
     * By default, event listeners are invoked in the order they are added. The`emitter.prependOnceListener()` method can be used as an alternative to add the
     * event listener to the beginning of the listeners stack.
     *
     * ```js
     * const myEE = new EventEmitter();
     * myEE.once('foo', () => console.log('a'));
     * myEE.prependOnceListener('foo', () => console.log('b'));
     * myEE.emit('foo');
     * // Prints:
     * //   b
     * //   a
     * ```
     * @param eventName The name of the event.
     * @param listener The callback function
     */
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Removes the specified `listener` from the listener stack for the event named `eventName`.
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
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     */
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Alias for `emitter.removeListener()`.
     */
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Removes all listeners, or those of the specified `eventName`.
     *
     * It is bad practice to remove listeners added elsewhere in the code,
     * particularly when the `EventEmitter` instance was created by some other
     * component or module (e.g. sockets or file streams).
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     */
    removeAllListeners(eventName?: string | symbol): this;
    /**
     * By default `EventEmitter`s will print a warning if more than `n` listeners are
     * added for a particular event. This is a useful default that helps finding
     * memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
     * modified for this specific `EventEmitter` instance. The value can be set to`Infinity` (or `0`) to indicate an unlimited number of listeners.
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     */
    setMaxListeners(n: number): this;
    /**
     * Returns the current max listener value for the `EventEmitter`.
     */
    getMaxListeners(): number;
    /**
     * Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
     * to each.
     *
     * Returns `true` if the event had listeners, `false` otherwise.
     *
     * ```js
     * const EventEmitter = require('events');
     * const myEmitter = new EventEmitter();
     *
     * // First listener
     * myEmitter.on('event', function firstListener() {
     *   console.log('Helloooo! first listener');
     * });
     * // Second listener
     * myEmitter.on('event', function secondListener(arg1, arg2) {
     *   console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
     * });
     * // Third listener
     * myEmitter.on('event', function thirdListener(...args) {
     *   const parameters = args.join(', ');
     *   console.log(`event with parameters ${parameters} in third listener`);
     * });
     *
     * console.log(myEmitter.listeners('event'));
     *
     * myEmitter.emit('event', 1, 2, 3, 4, 5);
     *
     * // Prints:
     * // [
     * //   [Function: firstListener],
     * //   [Function: secondListener],
     * //   [Function: thirdListener]
     * // ]
     * // Helloooo! first listener
     * // event with parameters 1, 2 in second listener
     * // event with parameters 1, 2, 3, 4, 5 in third listener
     * ```
     */
    emit(eventName: string | symbol, ...args: any[]): boolean;
    /**
     * Returns the number of listeners listening to the event named `eventName`.
     * @param eventName The name of the event being listened for
     */
    listenerCount(eventName: string | symbol): number;
    /**
     * Adds the `listener` function to the _beginning_ of the listeners array for the
     * event named `eventName`.
     *
     * ```js
     * server.prependListener('connection', (stream) => {
     *   console.log('someone connected!');
     * });
     * ```
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param eventName The name of the event.
     * @param listener The callback function
     */
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Adds a **one-time**`listener` function for the event named `eventName` to the_beginning_ of the listeners array. The next time `eventName` is triggered, this
     * listener is removed, and then invoked.
     *
     * ```js
     * server.prependOnceListener('connection', (stream) => {
     *   console.log('Ah, we have our first user!');
     * });
     * ```
     *
     * Returns a reference to the `EventEmitter`, so that calls can be chained.
     * @param eventName The name of the event.
     * @param listener The callback function
     */
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Returns an array listing the events for which the emitter has registered
     * listeners. The values in the array are strings or `Symbol`s.
     *
     * ```js
     * const EventEmitter = require('events');
     * const myEE = new EventEmitter();
     * myEE.on('foo', () => {});
     * myEE.on('bar', () => {});
     *
     * const sym = Symbol('symbol');
     * myEE.on(sym, () => {});
     *
     * console.log(myEE.eventNames());
     * // Prints: [ 'foo', 'bar', Symbol(symbol) ]
     * ```
     */
    eventNames(): Array<string | symbol>;
}
