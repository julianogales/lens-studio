/**
 * Scripting API of the Countdown Custom Component.
 */
interface Countdown {
    /**
     * Triggers when the countdown starts.
     *
     * @example
     * // @input ScriptComponent countdown
     * script.countdown
     *     .onCountdownStart
     *     .add(() => print("Started!"));
     */
    onCountdownStart: IEvent<void>
    /** Triggers when the countdown finishes.
     *
     * @example
     * // @input ScriptComponent countdown
     * script.countdown
     *     .onCountdownFinish
     *     .add(()=>print("Finish!"));
     */
    onCountdownFinish: IEvent<void>

    /** Starts countdown. */
    start(): void

    /** Whether countdown has started. */
    readonly isStarted: boolean
    /** Whether countdown has finished. */
    readonly isFinished: boolean

    /** Text size at the beginning of the animation. */
    startTextSize: number
    /** Text size at the end of animation. */
    endTextSize: number

    /** The text's color. */
    textColor: vec4

    /**  The sound that will be played when the counter changes. */
    sound?: AudioTrackAsset

    /**  The text's font. */
    font?: Font

}