/** @noSelfInFile */
import { IEventEmitter } from "./events.interfaces";
declare type CallbackFunction = (this: void, ...args: any[]) => void;
/**
 * An `IEventEmitter` implementation using arrays.
 */
declare class EventEmitter implements IEventEmitter {
    static defaultMaxListeners: number;
    protected maxListeners?: number;
    protected eventListenersArray: Record<string | symbol, {
        count: number;
        listeners: CallbackFunction[];
    }>;
    constructor();
    addListener(eventName: string | symbol, listener: CallbackFunction): this;
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
    on(eventName: string | symbol, listener: CallbackFunction): this;
    once(eventName: string | symbol, listener: CallbackFunction): this;
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
    removeListener(eventName: string | symbol, listener: CallbackFunction): this;
    off(eventName: string | symbol, listener: CallbackFunction): this;
    removeAllListeners(eventName?: string | symbol): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol): number;
    prependListener(eventName: string | symbol, listener: CallbackFunction): this;
    prependOnceListener(eventName: string | symbol, listener: CallbackFunction): this;
    eventNames(): (string | symbol)[];
}
export { EventEmitter };
