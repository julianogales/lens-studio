/**
 * The Visual Demonstration Custom Component provides controls for setting up different kinds
 * of hints in the lens.
 */
interface IVisualDemonstration {
    /** Start the appearance animation. */
    show(): void;

    /** Start the disappearance animation. */
    hide(): void;

    /** Turns off the visual demonstration without any animation. */
    forceHide(): void;

    /** Whether the visual demonstration is active at the moment. */
    readonly visible: boolean;

    /** Triggers when the appearance animation started. */
    onVisualDemonstrationStart: IEvent<void>;
    /** Triggers when the disappearance animation ended. */
    onVisualDemonstrationFinish: IEvent<void>;
}
