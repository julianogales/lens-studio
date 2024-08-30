
type Millis = number;
type Easing = (k: number) => number;
type Interpolation = (v: number[], k: number) => number;
interface Tween<T> {
    getId(): number;
    isPlaying(): boolean;
    to(properties: T, durationMs: Millis): Tween<T>;
    start(time?: number): Tween<T>;
    end(): Tween<T>;
    stop(): Tween<T>;
    stopChainedTweens(): void;
    delay(amountMs: Millis): Tween<T>;
    repeat(times: number): Tween<T>;
    repeatDelay(amountMs: Millis): Tween<T>;
    yoyo(yoyo: boolean): Tween<T>;
    easing(easing: Easing): Tween<T>;
    interpolation(interpolation: Interpolation): Tween<T>;
    chain(...args: Tween<any>[]): Tween<T>;
    onStart(callback: (params: T) => void): Tween<T>;
    onUpdate(callback: (params: T) => void): Tween<T>;
    onComplete(callback: (params: T) => void): Tween<T>;
    onStop(callback: (params: T) => void): Tween<T>;
    update(timeMs: Millis): boolean;
}

interface Group {
    readonly Tween: new <T>(params: T) => Tween<T>;
    getAll(): Tween<unknown>[];
    add(tween: Tween<any>): void;
    remove(tween: Tween<any>): void;
    update(timeMs: Millis, preserve: boolean): boolean;
    nextId(): number;
    now(): Millis;
    readonly Easing: Easings;
    readonly Interpolation: Interpolations;
}

interface EasingType {
    readonly In: Easing;
    readonly Out: Easing;
    readonly InOut: Easing;
}

interface Easings {
    readonly Linear: {
        readonly None: Easing;
    }
    readonly Quadratic: EasingType;
    readonly Cubic: EasingType;
    readonly Quartic: EasingType;
    readonly Quintic: EasingType;
    readonly Sinusoidal: EasingType;
    readonly Exponential: EasingType;
    readonly Circular: EasingType;
    readonly Elastic: EasingType;
    readonly Back: EasingType;
    readonly Bounce: EasingType;
}

interface Interpolations {
    readonly Linear: Interpolation;
    readonly Bezier: Interpolation;
    readonly CatmullRom: Interpolation;
    readonly Utils: {
        Linear(p0: number, p1: number, t: number): number;
        Bernstein(n: number, i: number): number;
        Factorial(n: number): number;
        CatmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number;
    };
}

declare namespace global {
    const TWEEN: Group;
}

declare const TWEEN: Group;
