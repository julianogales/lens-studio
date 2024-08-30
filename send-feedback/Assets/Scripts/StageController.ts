import { disable, enable } from './Modules/Utils';

/** Simply enables/disables SceneObjects on different stages of the quiz lifecycle. */
@component
export class StageController extends BaseScriptComponent {
    @input private readonly intro: SceneObject[];
    @input private readonly questions: SceneObject[];
    @input private readonly results: SceneObject[];

    onAwake() {
        this.intro.forEach(disable);
        this.questions.forEach(disable);
        this.results.forEach(disable);
    }

    public showIntro() {
        this.questions.forEach(disable);
        this.results.forEach(disable);
        this.intro.forEach(enable);
    }

    public showQuestions() {
        this.intro.forEach(disable);
        this.results.forEach(disable);

        this.questions.forEach(enable);
    }

    public showResults() {
        this.intro.forEach(disable);
        this.questions.forEach(disable);

        this.results.forEach(enable);
    }
}
