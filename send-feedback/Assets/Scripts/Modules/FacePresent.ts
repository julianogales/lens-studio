/** Tracks if there are any faces in camera. */
export class FacePresentEvent {
    /** Triggered when the first face appears in camera. */
    public readonly onFace: ((event: this) => void)[] = [];
    /** Triggered when the last face leaves camera. */
    public readonly onNoFace: ((event: this) => void)[] = [];

    private readonly script: ScriptComponent;
    private readonly faceFound: FaceFoundEvent;
    private readonly faceLost: FaceLostEvent;

    private lastFired = null;
    private _enabled = true;
    private _faceCount = 0;

    constructor(script: ScriptComponent) {
        this.script = script;
        this.faceFound = script.createEvent('FaceFoundEvent');
        this.faceLost = script.createEvent('FaceLostEvent');

        this.faceFound.bind(() => {
            this._faceCount++;
            if (this._faceCount > 0) {
                this._trigger(this.onFace);
            }
        });
        this.faceLost.bind(() => {
            this._faceCount--;
            if (this._faceCount == 0) {
                this._trigger(this.onNoFace);
            }
        });
    }

    public get faceCount() {
        return this._faceCount;
    }

    public get enabled() {
        return this._enabled;
    }

    /** Enabling the event also triggers corresponding onFace/onNoFace callbacks immediately. */
    public set enabled(value: boolean) {
        this._enabled = value;
        if (value) {
            this._trigger(this._faceCount > 0 ? this.onFace : this.onNoFace);
        } else {
            this.lastFired = null;
        }
    }

    public trigger() {
        this.lastFired = null;
        this._trigger(this._faceCount > 0 ? this.onFace : this.onNoFace);
    }

    public destroy() {
        this.script.removeEvent(this.faceFound);
        this.script.removeEvent(this.faceLost);
        this.onFace.splice(0);
        this.onNoFace.splice(0);
        this.lastFired = null;
    }

    private _trigger(cbs: ((event: FacePresentEvent) => void)[]) {
        if (this._enabled && cbs && cbs !== this.lastFired) {
            this.lastFired = cbs;
            cbs.forEach((cb) => cb && cb(this));
        }
    }
}
