declare enum LoopType {
    None = 0,
    Loop = 1,
    PingPong = 2,
    PingPongOnce = 3,
}

declare enum MovementType {
    FromTo = 0,
    To = 1,
    From = 2,
    Offset = 3
}

declare enum TransformType {
    Move = 0,
    Scale = 1,
    Rotate = 2
}

declare enum ValueDataType {
    Int = 0,
    Float = 1,
    Vec2 = 2,
    Vec3 = 3,
    Vec4 = 4,
    ColorRGB = 5,
    ColorRGBA = 6
}


type TweenType = "alpha" | "color" | "chain" | "screen_transform" | "transform" | "value";
type Alpha = { a: number; }
type Color = Alpha & { r: number; g: number; b: number; }
type X = { x: number; }
type XY = X & { y: number; }
type XYZ = XY & { z: number; }
type XYZW = XYZ & { w: number; }
type Value = Alpha | XY | XYZ | XYZW;
type AnyValue = Alpha | Color | X | XY | XYZ | XYZW;

interface TweenObject<T> {
    tween: Tween<T>,
    startValue: T,
    endValue: T,
    component: Component,
}

interface TweenValueScriptApi<V, T extends TweenType> extends TweenScriptApiBase<T> {
    time: number;
    start: V;
    end: V;
    manualStart: boolean;
    manualEnd: boolean;
    /** Will be available after setup */
    tweenObjects: TweenObject<V>[] | null;
    tween: Tween<V>[] | null;

    setStart(start: V): void;

    setEnd(end: V): void;

    setupTween(): Tween<V>;

    setupTweenBackwards(): Tween<V>;
}

interface TweenScriptApiBase<T extends TweenType> extends Record<string, any> {
    tweenObject: SceneObject | null;
    tweenType: T;
    tweenName: string;
    movementType: MovementType;
    loopType: LoopType;
    sceneObject: SceneObject;
    playAutomatically: boolean;

    startTween(): void;

    resetObject(): void;

    updateToStart(): void;

    updateToEnd(): void;

    setupTween(): unknown;

    setupTweenBackwards(): unknown;
}

interface ColorTweenApi extends TweenValueScriptApi<Color, "color"> {}

interface ScreenTransformTweenApi extends TweenValueScriptApi<X, "screen_transform"> {}

interface TransformTweenApi extends TweenValueScriptApi<XYZ, "transform"> {}

interface ValueTweenApi extends TweenValueScriptApi<Value, "value"> {}

interface AlphaTweenApi extends TweenValueScriptApi<Alpha, "alpha"> {}

interface AdditiveAlphaTweenApi extends AlphaTweenApi {
    movementType: MovementType.Offset;
    additive: boolean;
}

interface ChainTweenScriptApi extends TweenScriptApiBase<"chain"> {
    firstTween: Tween<unknown> | Tween<unknown>[] | null;
    lastTween: Tween<unknown> | Tween<unknown>[] | null;
    allTweens: Tween<unknown>[] | null;
    longestTween: Tween<unknown> | null;
    backwards: boolean;
    playAll: boolean;

    chainTweensInOrder(playAll: boolean, originalScript: AnyTweenScript): void;

    chainTweensBackwards(playAll: boolean, originalScript: AnyTweenScript): void;

    chainTweensPingPongOnce(originalScript: AnyTweenScript): void;

    setupTween(): void;

    setupTweenBackwards(): void;
}

interface TweenScript<T extends Record<string, any>> extends ScriptComponent {
    api: T
}

type AlphaTweenScript = TweenScript<AlphaTweenApi>;
type ColorTweenScript = TweenScript<ColorTweenApi>;
type ChainTweenScript = TweenScript<ChainTweenScriptApi>;
type ScreenTransformTweenScript = TweenScript<ScreenTransformTweenApi>;
type TransformTweenScript = TweenScript<TransformTweenApi>;
type ValueTweenScript = TweenObject<ValueTweenApi>;
type PredefinedTweenScript =
    AlphaTweenApi
    | ColorTweenScript
    | ChainTweenScript
    | ScreenTransformTweenScript
    | TransformTweenScript
    | ValueTweenScript;
type AnyTweenScript = TweenScript<TweenScriptApiBase<TweenType>>;
type Falsy = null | undefined | '' | 0 | false;
type SwitchedEasing<T> = T extends "In" ? "Out" : T extends "Out" ? "In" : "InOut";
type EasingTypeMap<T extends keyof Easings> = T extends "Linear" ? typeof global.TWEEN.Easing.Linear.None : keyof EasingType;
type If<S, T, F = undefined> = S extends Falsy ? F : T;
type NonFalsy<T> = T extends Falsy ? never : T;

/**
 * Caution: TweenManager does not support falsy tween names, so it won't find tweens in tween scripts without tween name set,
 * and all methods that receive falsy tweenName will be no-op, or return false/undefined.
 * While this declaratin tries to check for such cases, especially with --strictNullChecks enabled,
 * null and falsy values can come from JS/script parameters.
 */
interface TweenManager {
    addToRegistry(tweenScriptComponent: AnyTweenScript): boolean;

    cleanRegistry(): void;

    findTween<T extends string>(tweenObject: SceneObject, tweenName: T): If<T, AnyTweenScript>;

    findTweenRecursive<T extends string>(tweenObject: SceneObject, tweenName: T): If<T, AnyTweenScript>;

    getGenericTweenValue<T extends string>(tweenObject: SceneObject, tweenName: T): If<T, Value>;

    getSwitchedEasingType<T>(initialType: T): SwitchedEasing<T>;

    getTweenEasingType(easingFunction: keyof Easings, easingType: keyof EasingType): Easing;

    isPaused<T extends string>(tweenObject: SceneObject, tweenName: T): If<T, boolean, false>;

    isPlaying<T extends string>(tweenObject: SceneObject, tweenName: T): If<T, boolean, false>;

    resetTween<T extends string>(tweenObject: SceneObject, tweenName: NonFalsy<T>): void;

    resetTweens(): void;

    restartAutoTweens(): void;

    setStartValue<T extends string>(tweenObject: SceneObject, tweenName: NonFalsy<T>, startValue: AnyValue): void;

    setEndValue<T extends string>(tweenObject: SceneObject, tweenName: NonFalsy<T>, endValue: AnyValue): void;

    setTweenLoopType(tween: SceneObject, loopType: LoopType): void;

    startTween<T extends string>(
        tweenObject: SceneObject,
        tweenName: NonFalsy<T>,
        completeCallback?: (params: AnyValue) => void,
        startCallback?: (params: AnyValue) => void,
        stopCallback?: (params: AnyValue) => void
    ): void;

    stopTween<T extends string>(tweenObject: SceneObject, tweenName: NonFalsy<T>): void;

    resumeTween<T extends string>(tweenObject: SceneObject, _tweenName: NonFalsy<T>): void;

    pauseTween<T extends string>(tweenObject: SceneObject, _tweenName: NonFalsy<T>): void;
}

declare namespace global {
    let tweenManager: TweenManager
}
