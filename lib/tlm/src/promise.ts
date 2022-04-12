import { queue } from "./internal/processQueues";

// Rememeber: Do not recursively import `process` here!

// `this` (unused) param to be compatible with Lualib.

/** @noSelf */
type FulfillCallback<TData, TResult> = (
  value: TData
) => TResult | PromiseLike<TResult>;
/** @noSelf */
type RejectCallback<TResult> = (
  reason: any
) => TResult | PromiseLike<TResult>;

function tlmPromiseDeferred<T>() {
  let resolve: FulfillCallback<T, unknown>;
  let reject: RejectCallback<unknown>;
  const promise = new TlmPromise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

// TSTL `await` doesn't do this for us
// function adoptToPromise<T>(value: T) {
//   return value instanceof Promise ? value : Promise.resolve(value);
// }

/**
 * Represents the completion of an asynchronous operation in TLM.
 *
 * I swear I'll remove this when I'm not lazy to write a plugin for this.
 */
export class TlmPromise<T> extends Promise<T> {
  public then<TResult1 = T, TResult2 = never>(
    onFulfilled?: FulfillCallback<T, TResult1>,
    onRejected?: RejectCallback<TResult2>
  ): Promise<TResult1 | TResult2> {
    // onfulfilled and onrejected are called synchronously in TSTL, let's change that
    return TlmPromise.wrap(
      super.then(
        (value) => {
          return new Promise<TResult1>((resolve) => {
            queue("postPhase", () => {
              const valueOrPromise = onFulfilled(value);
              if (valueOrPromise instanceof Promise) {
                valueOrPromise.then((result) => {
                  resolve(result);
                });
              } else {
                resolve(valueOrPromise);
              }
            });
          });
        },
        (reason) => {
          return new Promise<TResult2>((resolve) => {
            queue("postPhase", () => {
              const valueOrPromise = onRejected(reason);
              if (valueOrPromise instanceof Promise) {
                valueOrPromise.then((result) => {
                  resolve(result);
                });
              } else {
                resolve(valueOrPromise);
              }
            });
          });
        }
      )
    );
  }

  static wrap<T>(this: void, originalPromise: Promise<T>) {
    const { promise, resolve, reject } = tlmPromiseDeferred<T>();

    originalPromise.then(
      (value) => {
        resolve(value);
      },
      (reason) => {
        reject(reason);
      }
    );

    return promise;
  }
}
