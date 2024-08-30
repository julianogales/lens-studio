interface IEvent<T = any> {
    /**
     * Adds a listener function to the list of listeners for this event.
     * @param listener The listener function that processes the event.
     */
    add(listener: (data: T) => void): void;

    /**
     * Adds a listener function that will be removed after its first invocation.
     * @param listener The listener function to invoke only once.
     */
    addOnce(listener: (data: T) => void): void;

    /**
     * Removes a specific listener from the list of listeners for this event.
     * @param listener The listener function to remove.
     */
    remove(listener: (data: T) => void): void;

    /** Removes all listeners and once listeners for this event. */
    clear(): void;

    /**
     * Triggers the event, calling all registered listeners in the order they were added.
     * Errors in listeners do not prevent subsequent listeners from being called.
     * @param data The data to pass to each listener function.
     */
    trigger(data: T): void;

    /** Disables triggering of the event. */
    disable(): void;

    /** Enables triggering of the event. */
    enable(): void;

    /** Returns the number of attached listeners. */
    listenerCount(): number;
}
