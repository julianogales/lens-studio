import { QuizController } from './QuizController';
import { disable, enable } from './Modules/Utils';

/**
 * An example of logic to start quiz. This one is made purposefully for switching examples in the template,
 * you may wish to alter it, for example by adding a button to start the quiz instead of delay.
 */
@component
export class Launcher extends BaseScriptComponent {
    @input('float', '1') private readonly delayBeforeTween: number = 1;
    @input private readonly quizController: QuizController;
    @input('Component.ScriptComponent')
    private readonly glowTween: AnyTweenScript;

    @input private readonly toEnable: SceneObject[];
    @input private readonly toDisable: SceneObject[];

    onAwake() {
        this.toDisable.forEach(disable);
        this.toEnable.forEach(enable);
        const evt = this.createEvent('DelayedCallbackEvent');
        evt.bind(() => {
            this.removeEvent(evt);
            global.tweenManager.startTween(this.glowTween.getSceneObject(),
                this.glowTween.api.tweenName,
                () => this.quizController.askQuestions());
        });
        evt.reset(this.delayBeforeTween);
    }
}
