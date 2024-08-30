import { FacePresentEvent } from '../Modules/FacePresent';
import { log, disable, enable } from '../Modules/Utils';

@typedef
class Stage {
    @input readonly decorations: SceneObject[];
    @input readonly noFaceDecorations: SceneObject[];
}

/**
 * Enables a bunch of SceneObjects for chosen index, disabling the rest.
 * A set of SceneObjects to be shown also depends on whether there are any faces in camera.
 * Useful when you want to add decorations to the user's head, but also provide a fallback if there is none.
 * May also show a hint to the user that there is additional content, if they are not in the camera.
 */
@component
export class DecorationsController extends BaseScriptComponent implements IDecorationsController {
    @input('Component.ScriptComponent')
    @allowUndefined
    private readonly findFaceHint: IVisualDemonstration;

    @input
    private readonly decorations: Stage[];

    @input
    private readonly debug: boolean;

    private readonly facePresent = new FacePresentEvent(this);

    private current: number = -1;
    private hintShown = false;

    onAwake() {
        this.findFaceHint?.forceHide();
        this.facePresent.onFace.push(() => this.onFace());
        this.facePresent.onNoFace.push(() => this.onNoFace());
        this.decorations.forEach(s => this.hideStage(s));
    }

    public showStageIdx(index: number) {
        this.debugLog('Stage: ' + index);
        this.hideStage(this.decorations[this.current]);
        this.hintShown = this.current == index;
        this.current = index;
        // this event will trigger corresponding onFace/onNoFace callbacks upon enabling
        this.facePresent.enabled = true;
    }

    public reset() {
        this.hideStage(this.decorations[this.current]);
        this.current = -1;
    }

    private hideStage(stage: Stage | undefined) {
        this.facePresent.enabled = false;
        if (stage) {
            stage.decorations.forEach(disable);
            stage.noFaceDecorations.forEach(disable);
        }
    }

    private onFace() {
        this.findFaceHint?.hide();
        const stage = this.decorations[this.current];
        if (stage) {
            stage.noFaceDecorations.forEach(disable);
            stage.decorations.forEach(enable);
        }
    }

    private onNoFace() {
        if (!this.hintShown) {
            this.findFaceHint?.show();
            this.hintShown = true;
        }
        const stage = this.decorations[this.current];
        if (stage) {
            stage.decorations.forEach(disable);
            stage.noFaceDecorations.forEach(enable);
        }
    }

    private debugLog(msg: string) {
        if (this.debug) {
            log(this.getSceneObject().name + ': ' + msg);
        }
    }
}
