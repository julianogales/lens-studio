interface BehaviorSystem {
    /** Sends out a global Custom Trigger that BehaviorScripts can react to. */
    sendCustomTrigger(triggerName: string);

    /** Adds a callback function to call when the Custom Trigger is sent. */
    addCustomTriggerResponse(triggerName: string, callback: () => void);

    /** Remove the callback function from the Custom Trigger's responses. */
    removeCustomTriggerResponse(triggerName: string, callback: () => void);

}

interface BehaviorApi {
    /** Manually trigger the BehaviorScript's response. */
    trigger();

    /** Add a callback function to call when this BehaviorScript is triggered. */
    addTriggerResponse(callback: () => void);

    /** Remove the callback function from this BehaviorScript's response. */
    removeTriggerResponse(callback: () => void);
}

/** An instance of Behavior script. */
interface BehaviorScript extends BehaviorApi, ScriptComponent {
    /** @deprecated skip it and call methods on script directly instead. */
    readonly api: BehaviorApi;
}

declare namespace global {
    /** Global API of the {@link https://docs.snap.com/lens-studio/references/guides/lens-features/adding-interactivity/helper-scripts/behavior#global-api|Behavior system}.
     */
    const behaviorSystem: BehaviorSystem;
}
