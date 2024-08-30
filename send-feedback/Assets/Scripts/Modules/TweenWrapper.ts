/** Encapsulates a tween for simpler reuse without specifying parameters each time. */
export class TweenWrapper<T, A = any> {
    params: T;
    to: T;
    duration: number;
    startParams: T;
    tween: Tween<T>;
    attachment: A;
    onReset?: () => void;

    constructor(params: T, to: T, durationSeconds: number) {
        this.onReset = null;
        this.startParams = Object.assign({}, params);
        this.params = params;
        this.to = Object.assign({}, to);
        this.duration = durationSeconds;
        this.tween = new global.TWEEN.Tween(params);
    }
    reset() {
        for (const k in this.params) {
            this.params[k] = this.startParams[k];
        }
        this.onReset && this.onReset();
        return this;
    }
    resetToStart() {
        this.reset();
        const t: any = this.tween;
        if (t._onUpdateCallback) {
            t._onUpdateCallback(this.startParams);
        }
        return this;
    }
    start(duration = null) {
        for (const k in this.params) {
            this.params[k] = this.startParams[k];
        }
        if (typeof duration !== 'number' || isNaN(duration)) {
            duration = this.duration;
        }
        this.tween.to(this.to, duration * 1000).start();
        this.tween.update(0);
        return this;
    }
    stop() {
        this.tween.stop();
        return this;
    }
}
