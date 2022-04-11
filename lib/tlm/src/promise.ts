import { postPhase } from "./process";

// `this` (unused) param to be compatible with Lualib.
type FulfillCallback<TData, TResult> = (
  this: any,
  value: TData
) => TResult | PromiseLike<TResult>;
type RejectCallback<TResult> = (this: any, reason: any) => TResult | PromiseLike<TResult>;

function tlmPromiseDeferred<T>() {
  let resolve: FulfillCallback<T, unknown>;
  let reject: RejectCallback<unknown>;
  const promise = new TlmPromise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

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
          return new Promise<TResult1>((res) => {
            postPhase(async () => {
              res(await onFulfilled(value));
            });
          });
        },
        (reason) => {
          return new Promise<TResult2>((res) => {
            postPhase(async () => {
              res(await onRejected(reason));
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
