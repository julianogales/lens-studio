// MainLogic[State 1].js
// Description: this script manages the rotation through prompts, 
// updating text and background images based on the index of the 
// current prompt. It provides a function to show the next prompt 
// in the sequence and utility functions to set and get the current 
// prompt index.

/**
 * @typedef Prompt
 * @property {string} top {"label": "Top Text"}
 * @property {Asset.Texture} topBG
 * @property {string} bottom {"label": "Bottom Text"}
 * @property {Asset.Texture} botBG {"label": "Bottom BG"}
 */

//@input float rollDuration
//@input int rollCount
//@ui {"widget":"separator"}
//@input Component.Text topText
//@input Component.Text bottomText
//@input Asset.Material topBG
//@input Asset.Material botBG
//@ui {"widget":"separator"}
//@input Prompt[] prompts

const {randomSequence} = require("GlobalUtilities");

script.showNext = showNext;

/** @type {Text} */
const topText = script.topText;
/** @type {Text} */
const bottomText = script.bottomText;

const topBG = script.topBG.mainPass;
const botBG = script.botBG.mainPass;

/** @type {number[]} */
const indices = Array.from({ length: script.prompts.length });
for (let i = 0; i < indices.length; ++i) {
    indices[i] = i; 
}
/** @type {Prompt[]} */
const prompts = script.prompts;

/** @type {Generator<number>} */
const sequence = randomSequence(indices);
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
 * Show the next prompt in the sequence.
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
 * Set the text and background images for the top and bottom prompts based on the provided index.
 * @param {number} promptIdx - The index of the prompt to be shown.
 */
function setPromptIdx(promptIdx) {
    shownIdx = promptIdx;
    const prompt = prompts[promptIdx];
    topText.text = prompt.top;
    topBG.mainTex = prompt.topBG;
    bottomText.text = prompt.bottom;
    botBG.mainTex = prompt.botBG;
}

/**
 * Get the index of the currently shown prompt.
 * @returns {number} The index of the currently shown prompt.
 */
function getPromptIdx() {
    return shownIdx;
}
