// TweenWrapper 
// Version: 0.0.1
// Description: This file contains the TweenWrapper class, 
// which serves as a wrapper for the Tween.js library to handle tweens easily.

/**
 * TweenWrapper class represents a wrapper for Tween.js library to handle tweens easily.
 * @constructor
 * @param {object} params - Initial parameters for the tween.
 * @param {object} to - Target parameters to tween to.
 * @param {number} duration - Duration of the tween in seconds.
 */
class TweenWrapper {
    /**
     * Constructs a new TweenWrapper instance.
     * @param {object} params - Initial parameters for the tween.
     * @param {object} to - Target parameters to tween to.
     * @param {number} duration - Duration of the tween in seconds.
     */
    constructor(params, to, duration) {
        this.onReset = null;
        this.startParams = Object.assign({}, params);
        this.params = params;
        this.to = to;
        this.duration = duration;
        this.tween = new global.TWEEN.Tween(params);
    }
    
    /**
     * Resets the tween to its initial state.
     * @returns {TweenWrapper} - Returns the TweenWrapper instance for chaining.
     */
    reset() {
        for (let k in this.params) {
            this.params[k] = this.startParams[k];
        }
        this.onReset && this.onReset();
        return this;
    }
    /**
     * Starts the tween animation.
     */
    start() {
        for (let k in this.params) {
            this.params[k] = this.startParams[k];
        }
        this.tween.to(this.to, this.duration * 1000).start();
    }
}

module.exports = TweenWrapper;