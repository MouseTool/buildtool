interface DoublyLinkedListNode<T> {
  value: T;
  next?: DoublyLinkedListNode<T>;
  prev?: DoublyLinkedListNode<T>;
}

/**
 * Doubly linked list implementation.
 *
 * Indexes / positions mentioned hereinafter start from `0`. This means that the first front
 * element always has an index of `0`.
 */
export default class DoublyLinkedList<T> {
  private _size: number;
  private _front?: DoublyLinkedListNode<T>;
  private _back?: DoublyLinkedListNode<T>;

  constructor(values?: Iterable<T> | T[]) {
    this._size = 0;

    // Taken from TSTL Lualib
    if (values !== undefined) {
      const iterable = values as Iterable<T>;
      if (iterable[Symbol.iterator]) {
        // Iterate manually because why not ?
        const iterator = iterable[Symbol.iterator]();
        while (true) {
          const result = iterator.next();
          if (result.done) {
            break;
          }
          this.pushBack(result.value);
        }
      } else {
        const array = values as T[];
        for (const value of array) {
          this.pushBack(value);
        }
      }
    }
  }

  get size() {
    return this._size;
  }

  clear() {
    this._size = 0;
    this._front = null;
    this._back = null;
    return this;
  }

  /**
   * Inserts an element to the end.
   */
  pushBack(value: T) {
    const node = {
      value,
      prev: this._back,
    } as DoublyLinkedListNode<T>;
    if (!this._front) {
      this._front = node;
    }
    if (this._back) {
      this._back.next = node;
    }
    this._back = node;
    this._size++;
    return this;
  }

  /**
   * Inserts an element to the front.
   */
  pushFront(value: T) {
    const node = {
      value,
      prev: this._front,
    } as DoublyLinkedListNode<T>;
    if (!this._back) {
      this._back = node;
    }
    if (this._front) {
      this._front.prev = node;
    }
    this._front = node;
    this._size++;
    return this;
  }

  /**
   * Inserts an element at the specified position.
   */
  insertAt(position: number, value: T): boolean {
    if (position < 0 || position > this.size) return false;

    // TODO: Can reduce loop time if position = size using position < size/2 ?
    let beforeNode = this._front?.prev;
    for (let i = 0; i < position; i++) {
      beforeNode = beforeNode.next;
    }
    const afterNode = beforeNode?.next ?? this._front;

    const node = {
      value,
      prev: beforeNode,
      next: afterNode,
    } as DoublyLinkedListNode<T>;

    if (!this._back) {
      this._back = node;
    }
    if (!this._front) {
      this._front = node;
    }

    if (beforeNode) {
      beforeNode.next = node;
    }
    if (afterNode) {
      afterNode.prev = node;
    }

    this._size++;
    return true;
  }

  /**
   * Removes and retrieves an element at the specified position.
   */
  popAt(position: number): T | undefined {
    if (position < 0 || position >= this.size) return;

    // TODO: Can reduce loop time if position = size using position < size/2 ?
    let node = this._front;
    for (let i = 1; i <= position; i++) {
      node = node.next;
    }
    const beforeNode = node.prev;
    const afterNode = node.next;

    if (beforeNode) beforeNode.next = afterNode;
    if (afterNode) afterNode.prev = beforeNode;

    this._size--;
    return node.value;
  }

  /**
   * Removes and retrieves an element at the specified position.
   */
  getAt(position: number): T | undefined {
    if (position < 0 || position >= this.size) return;

    // TODO: Can reduce loop time if position = size using position < size/2 ?
    let node = this._front;
    for (let i = 1; i <= position; i++) {
      node = node.next;
    }

    return node.value;
  }

  /**
   * Removes and retrieves the last element.
   */
  popBack(): T | undefined {
    if (!this._back) return;

    const value = this._back.value;
    this._back = this._back.prev;
    if (this._back) {
      this._back.next = null;
    } else {
      this._front = null;
    }

    this._size--;
    return value;
  }

  /**
   * Removes and retrieves the first element.
   */
  popFront(): T | undefined {
    if (!this._front) return;

    const value = this._front.value;
    this._front = this._front.next;
    if (this._front) {
      this._front.prev = null;
    } else {
      this._back = null;
    }

    this._size--;
    return value;
  }

  /**
   * Retrieves the last element.
   */
  back(): T | undefined {
    return this._back?.value;
  }

  /**
   * Retrieves the first element.
   */
  front(): T | undefined {
    return this._front?.value;
  }

  public [Symbol.iterator](): IterableIterator<T> {
    return this.values();
  }

  values() {
    let node = this._front;
    return {
      [Symbol.iterator](): IterableIterator<T> {
        return this;
      },
      next() {
        const result = { done: !node, value: node?.value } as IteratorResult<T>;
        node = node.next;
        return result;
      },
    } as IterableIterator<T>;
  }

  entries() {
    let node = this._front;
    let index = 0;
    return {
      [Symbol.iterator](): IterableIterator<[number, T]> {
        return this;
      },
      next() {
        const result = {
          done: !node,
          value: node ? [index, node.value] : null,
        } as IteratorResult<[number, T]>;
        node = node.next;
        index++;
        return result;
      },
    } as IterableIterator<[number, T]>;
  }

  reverseEntries() {
    let node = this._back;
    let index = this.size - 1;
    return {
      [Symbol.iterator](): IterableIterator<[number, T]> {
        return this;
      },
      next() {
        const result = {
          done: !node,
          value: node ? [index, node.value] : null,
        } as IteratorResult<[number, T]>;
        node = node.prev;
        index++;
        return result;
      },
    } as IterableIterator<[number, T]>;
  }
}
