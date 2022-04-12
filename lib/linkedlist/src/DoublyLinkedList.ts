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
   * Finds the node at `position`. No boundary checks.
   */
  protected findNth(position: number) {
    // TODO: Can reduce loop time if position = size using position < size/2 ?
    let node = this._front;
    //for (let i = 1; i <= position; i++) {
    for (const _ of $range(1, position)) {
      node = node.next;
    }
    return node;
  }

  /**
   * Inserts an element at the specified position.
   */
  insertAt(position: number, value: T): boolean {
    if (position < 0 || position > this.size) return false;
    if (position === 0) {
      this.pushFront(value);
      return true;
    }
    if (position === this.size) {
      this.pushBack(value);
      return true;
    }

    const afterNode = this.findNth(position);
    const beforeNode = afterNode.prev;
    const node = {
      value,
      prev: beforeNode,
      next: afterNode,
    } as DoublyLinkedListNode<T>;

    // Both will not be null as `position` is never at one of the far ends here.
    beforeNode.next = node;
    afterNode.prev = node;

    this._size++;
    return true;
  }

  /**
   * Removes and retrieves an element at the specified position.
   */
  popAt(position: number): T | undefined {
    if (position < 0 || position >= this.size) return;
    if (position === 0) return this.popFront();
    if (position === this.size - 1) return this.popBack();

    const node = this.findNth(position);
    const beforeNode = node.prev;
    const afterNode = node.next;

    // Both will not be null as `position` is never at one of the far ends here.
    beforeNode.next = afterNode;
    afterNode.prev = beforeNode;

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
    const node = this._back
    if (!node) return;

    const value = node.value;
    const replacementNode = node.prev;
    this._back = replacementNode;

    if (replacementNode) {
      replacementNode.next = null;
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
    const node = this._front;
    if (!node) return;

    const value = node.value;
    const replacementNode = node.next;
    this._front = replacementNode;

    if (replacementNode) {
      replacementNode.prev = null;
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
