'use strict';

class AsyncIterator {

    constructor() {
        this.limit = 5;
        this.current = 1;
    }

    next() {
        let done = (this.current > this.limit);
        return Promise.resolve({
            value: done ? undefined : this.current++,
            done
        });
    }

    [Symbol.asyncIterator]() { return this; }
}

async function t() {
    let it = new AsyncIterator();
    for await (let x of it) {
        console.log(x);
    }
}

t();