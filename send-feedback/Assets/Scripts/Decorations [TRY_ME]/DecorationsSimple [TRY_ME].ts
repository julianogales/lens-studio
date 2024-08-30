import { log, disable } from '../Modules/Utils';

@typedef
class Stage {
    @input readonly decorations: SceneObject[];
}

/** Enables a bunch of SceneObjects for chosen index, disabling the rest. */
@component
export class DecorationsController extends BaseScriptComponent implements IDecorationsController {

    @input private readonly decorations: Stage[];

    @input private readonly debug: boolean;

    private current: number = -1;

    onAwake() {
        this.decorations.forEach(s => this.hideStage(s));
    }

    public showStageIdx(index: number) {
        if (this.debug) {
            log(this.getSceneObject().name + ': ' + 'Stage: ' + index);
        }
        this.hideStage(this.decorations[this.current]);
        this.current = index;
    }

    /** Hide all known SceneObjects */
    public reset() {
        this.hideStage(this.decorations[this.current]);
        this.current = -1;
    }

    private hideStage(stage: Stage | undefined) {
        if (stage) {
            stage.decorations.forEach(disable);
        }
    }
}
