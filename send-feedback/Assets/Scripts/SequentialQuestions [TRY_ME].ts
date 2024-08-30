import { log } from './Modules/Utils';

/**
 * A simple questions controller, just shows all available questions in the original sequence.
 */

@component
export class SequentialQuestions extends BaseScriptComponent implements IQuestionsController {
    @input('Component.ScriptComponent')
    private readonly decorationsController: IDecorationsController;

    @input
    @hint('Prepend a line with an index of current question and a total number of questions')
    private readonly autonumerate: boolean;

    @input private readonly questionParent: SceneObject;
    @input private readonly questionPrefab: ObjectPrefab;

    private questions: QuestionDescription[];
    private _currentQuestion = -1;

    // using this, so the disappearance of the previous question could overlap with
    // appearance of the next one
    private doubleBuffer: [IFadeText, IFadeText];
    private currentTextSetter = 0;

    onAwake() {
        const so1 = this.questionPrefab.instantiate(this.questionParent);
        so1.enabled = true;
        const text1: IFadeText = so1.getComponent('ScriptComponent') as any;

        const so2 = this.questionPrefab.instantiate(this.questionParent);
        so2.enabled = true;
        const text2 = so2.getComponent('ScriptComponent') as any;

        this.doubleBuffer = [text1 as IFadeText, text2 as IFadeText];

        text1.forceHide();
        text2.forceHide();
    }

    public setQuestions(questions: QuestionDescription[]) {
        this.questions = questions;
    }

    public nextQuestion(): boolean {
        if (this._currentQuestion >= 0) {
            this.doubleBuffer[this.currentTextSetter].fadeOut();
            this.currentTextSetter = (this.currentTextSetter + 1) % this.doubleBuffer.length;
        }

        this._currentQuestion++;

        if (0 <= this._currentQuestion && this._currentQuestion < this.questions.length) {
            this.decorationsController.showStageIdx(this._currentQuestion);
            const textSetter = this.doubleBuffer[this.currentTextSetter];
            textSetter.setText(this.numerate(this.questions[this._currentQuestion].question));
            textSetter.fadeIn();
            return true;
        } else {
            log('No more questions.');
            return false;
        }
    }

    public get currentQuestion(): number {
        return this._currentQuestion;
    }

    public get currentQuestionView(): number {
        return this._currentQuestion;
    }

    public get hasNext(): boolean {
        return (this._currentQuestion + 1) < this.questions.length;
    }

    public reset(): void {
        this._currentQuestion = -1;
        this.decorationsController.reset();
        this.doubleBuffer[this.currentTextSetter].forceHide();
    }

    private numerate(text: string): string {
        return this.autonumerate
            ? (this._currentQuestion + 1) + '/' + this.questions.length + '\n' + text
            : text;
    }
}
