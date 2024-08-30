// MainLogic[State 2].js
// Description: this file contains the logic for implementing the animated
// display of a sequence of text prompts.

//@input float rollDuration
//@input int rollCount
//@ui {"widget":"separator"}
//@input Component.Text[] textSet
//@input string[] prompts
//@ui {"widget":"separator"}

const {nonRepeating, chunked, randomSequence} = require("GlobalUtilities");

script.showNext = showNext;

/** @type {Text[]} */
const texts = script.textSet;
/** @type {number[]} */
const indices = Array.from({ length: script.prompts.length });
for (let i = 0; i < indices.length; ++i) {
    indices[i] = i; 
}
/** @type {string[]} */
const prompts = script.prompts;

const sequence = nonRepeating(chunked(randomSequence(indices), texts.length));
/** @type {TweenWrapperConstructor} */
const TweenWrapper = require("./../TweenWrapper");

const roll = initTween();

/**
 * Initializes the rolling animation.
 * @returns {TweenWrapper} The initialized TweenWrapper instance.
 */
function initTween() {
    const wrapper = new TweenWrapper({ value: 0 }, { value: script.rollCount }, script.rollDuration);
    let last = -1;
    wrapper.tween
        .onUpdate(({ value }) => {
            const next = Math.floor(value);
            if (next != last) {
                setPromptIdx(sequence.next().value);
                last = next;
            }
        });
    return wrapper;
}

let shownIdx = -1;
/**
 * Shows the next prompt in the sequence.
 * @returns {Promise<number>} A promise that resolves with the index of the shown prompt.
 */
function showNext() {
    return new Promise((resolve) => {
        roll.reset();
        const last = getPromptIdx();
        roll.tween.onComplete(() => {
            if (getPromptIdx() == last) {
                setPromptIdx(sequence.next().value);
            }
            resolve(shownIdx);
        });
        roll.start();
    });
}


/**
 * Sets the displayed prompt based on the given prompt index.
 * @param {number[]} promptIdx - The index of the prompt to set.
 */
function setPromptIdx(promptIdx) {
    shownIdx = promptIdx;
    texts.forEach((t, i) => t.text = prompts[promptIdx[i]]);
}

// Function to get the current prompt index
function getPromptIdx() {
    return shownIdx;
}

