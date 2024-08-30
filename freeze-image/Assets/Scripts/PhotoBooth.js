// PhotoBooth.js
// Version: 0.0.1
// Description: this file contains two classes, Frame and Booth, along with some helper functions.
// The Frame class represents a single frame with or without blur effect, and the Booth class represents
// a sequence of frames to be captured.

/**
 * @typedef Frame
 * @property {Asset.Material} material
 * @property {string} textureParameter = "baseTex"
 * @property {Component.ScriptComponent} countdown
 */

//@input Component.InteractionComponent resetButton
//@input Component.ScriptComponent promptRandomizer
//@input Frame[] frames


/**
 * Represents a single frame with or without blur effect.
 * @class Frame
 */
class Frame {
    /** Constructs a new Frame instance.
     * @param {FrameDesc} desc 
     */
    constructor(desc) {
        if (!desc.material || !desc.textureParameter || !desc.countdown) {
            return undefined;
        }
        this.pass = desc.material.mainPass;
        this.paramName = desc.textureParameter;
        this.original = this.texture;
        /** @type {Countdown} */
        this.countdown = desc.countdown;
        this._callback = null;
        this.countdown.onCountdownFinish.add(() => {
            if (this._callback) {
                this.shoot();
                this._callback();
            }
        });
    }

    /**
     * Gets the current texture of the frame.
     * @returns {Texture} - The current texture of the frame.
     */
    get texture() {
        return this.pass[this.paramName];
    }
    /**
     * Sets the texture of the frame.
     * @param {Texture} value - The texture to set.
     */
    set texture(value) {
        this.pass[this.paramName] = value;
    }
    /**
     * Triggers the frame action.
     * @param {function} callback - The callback function to execute after the action.
     */
    trigger(callback) {
        this._callback = callback;
        this.countdown.start();
    }
    /**
     * Captures the frame.
     */
    shoot() {
        this.texture = this.original.copyFrame();
    }
    /**
     * Restores the frame to its original state.
     */
    restore() {
        this.texture = this.original;
    }
    /**
     * Stops the frame action.
     */
    stop() {
        this._callback = null;
    }
}

/** @param {Frame[]} frames */
function* startBooth(frames, afterTrigger) {
    for (let i = 0; i < frames.length; ++i) {
        const frame = frames[i];
        frame.trigger(afterTrigger);
        yield frame;
    }
}

/**
 * Represents a sequence of frames to be captured.
 * @class Booth
 */
class Booth {
    /**
     * Constructs a new Booth instance.
     * @param {Frame[]} frames - Array of frames to capture.
     */
    constructor(frames) {
        /** @type {Frame[]} frames  */
        this.frames = frames;
        this._reject = null;
    }
    /**
     * Starts capturing frames.
     * @returns {Promise<void>} - Promise that resolves when the capture is complete.
     */
    start() {
        return new Promise((resolve, reject) => {
            this.sequence = startBooth(this.frames, () => {
                this.current = this.sequence.next().value;
                if (!this.current) {
                    resolve();
                }
            });
            this.current = this.sequence.next().value;
            this._reject = reject;
        });
    }
    /**
     * Stops capturing frames.
     */
    stop() {
        if (this.current) {
            this.current.stop();
        }
        if (this._reject) {
            this._reject();
        }
    }
    /**
     * Restores the booth to its initial state.
     */
    restore() {
        this.frames.forEach((f) => f.restore());
    }
}


/** @type {{showNext():Promise<number>}} */
const promptRandomizer = script.promptRandomizer;

/** @type {Frame[]} */
let frames = script.frames.map((desc) => new Frame(desc)).filter((f) => f);

const booth = new Booth(frames);

/** @type {InteractionComponent} */
const resetButton = script.resetButton;
resetButton.onTap.add(start);
start();

/**
 * Starts the booth process.
 */
function start() {
    resetButton.getSceneObject().enabled = false;
    booth.restore();
    promptRandomizer.showNext().then(() => booth.start().then(finish));
}

/**
 * Finishes the booth process.
 */
function finish() {
    resetButton.getSceneObject().enabled = true;
}

script.start = start;
