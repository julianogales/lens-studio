// GlobalUtilities.js
// Description: This file contains a set of utility functions for working 
// with arrays and generating random sequences in JavaScript.
/** @module GlobalUtilities */

/**
 * Generates a random integer in the range [lo, hi).
 * @param {number} lo - The lower bound (inclusive).
 * @param {number} hi - The upper bound (exclusive).
 * @returns {number} - The random integer.
 */
function randomInt(lo, hi) {
    return Math.floor(MathUtils.randomRange(lo, hi));
}

/*
 * Durstenfeld-Knuth variation of Fisher–Yates unbiased in-place shuffle.
 * Complexity: O(arr.length)
 * @template T
 * @param {T[]} arr - The array to shuffle.
 */
function shuffle(arr) {
    for (var i = 0; i < arr.length - 1; ++i) {
        const swapWith = randomInt(i, arr.length);
        const tmp = arr[i];
        arr[i] = arr[swapWith];
        arr[swapWith] = tmp;
    }
    return arr;
}


/** 
 * Returns an infinite sequence of items in random order without repetitions,
 * except when the length of items is 1, in which case it will be the same element, or 2,
 * in which case it will be a different element.
 * @template T
 * @param {T[]} items - The array of items.
 */
function* randomSequence(items) {
    shuffle(items);
    let currentIdx = -1;
    while (true) {
        const last = items[currentIdx++];
        if (currentIdx >= items.length) {
            shuffle(items);
            currentIdx = 0;
        }
        let current = items[currentIdx];
        if (current === last && items.length > 1) {
            current = items[++currentIdx];
        }
        yield current;
    }
}

/**
 * Splits a sequence into chunks of a specified size.
 * @template T
 * @param {Generator<T, never, void>} seq - The input sequence.
 * @param {number} chunkSize - The size of each chunk.
 * @returns {Generator<T[], never, void>} - A generator yielding chunked arrays.
 */
function* chunked(seq, chunkSize) {
    while (true) {
        const result = Array.from({ length: chunkSize });
        for (let i = 0; i < chunkSize; ++i) {
            result[i] = seq.next().value;
        }
        yield result;
    }
}

/**
 * Ensures that elements in each sequence are not repeated within the sequence.
 * @template T
 * @param {Generator<T[], never, void>} seq - The input sequence.
 * @param {number} maxTries - Maximum number of attempts to generate a non-repeating sequence.
 * @returns {Generator<T[], never, void>} - A generator yielding non-repeating arrays.
 */
function* nonRepeating(seq, maxTries = 10) {
    let tries = 0;
    while (true) {
        const next = seq.next().value;
        const set = new Set(next);
        if (set.size == next.length) {
            tries = 0;
            yield next;
        } else {
            if (++tries >= maxTries) {
                tries = 0;
                yield next;
            }
        }
    }
}

module.exports = {
    randomInt,
    shuffle,
    randomSequence,
    chunked,
    nonRepeating
};



