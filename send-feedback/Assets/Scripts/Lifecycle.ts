import { log } from './Modules/Utils';

type HandlerKind = 'Behavior Custom Trigger' | 'Behavior Script' | 'Script method';

@typedef
export class EventHandler {
    @input('string', 'Behavior Custom Trigger')
    @widget(new ComboBoxWidget()
        .addItem('Behavior Custom Trigger')
        .addItem('Behavior Script')
        .addItem('Script method'))
    readonly kind: HandlerKind;

    @input
    @showIf('kind', 'Behavior Custom Trigger')
    readonly customTrigger: string;

    @input('Component.ScriptComponent')
    @showIf('kind', 'Behavior Script')
    readonly behaviorScript: BehaviorScript;

    @input
    @showIf('kind', 'Script method')
    readonly script: ScriptComponent;
    @input
    @showIf('kind', 'Script method')
    readonly methodName: string;
    @input
    @showIf('kind', 'Script method')
    @ui.label('Use .api convention')
    @hint('Older scripts expose their API via .api property, this is a deprecated convention and shouldn\'t be used for newer scripts.')
    readonly onApi: boolean;
}

/**
 * Provides a way to configure quiz lifecycle events listeners through the UI.
 */
@component
export class Lifecycle extends BaseScriptComponent {
    @input
    private readonly suppressScriptErrors: boolean;

    @input
    public readonly onIntroShown: EventHandler[];

    @ui.separator

    @ui.label('For scripts: called with parameter: QuizData')
    @input
    public readonly onQuizDataAvailable: EventHandler[];

    @ui.separator

    @input
    public readonly onIntroHidden: EventHandler[];

    @ui.separator

    @input
    public readonly onQuestionsShown: EventHandler[];

    @ui.separator

    @ui.label('For scripts: called with parameters: index of the question shown, index of the question view and a flag indicating if this is the last question')
    @input
    public readonly onNextQuestion: EventHandler[];

    @ui.separator

    @ui.label('For scripts: called with parameters: was the answer correct (boolean|null), index of the selected answer, index of the question and the index of the current question view')
    @input
    public readonly onAnswer: EventHandler[];

    @ui.separator

    @input
    public readonly onQuestionsHidden: EventHandler[];

    @ui.separator

    @ui.label('For scripts: called with parameters: index of the final result, total number of questions asked, number of answers matching the result')
    @input
    public readonly onResultShown: EventHandler[];

    @ui.separator

    @input
    public readonly onResultHidden: EventHandler[];

    @ui.separator

    @input
    public readonly onReset: EventHandler[];

    introShown() {
        this.onIntroShown.forEach(h => this.handle(h, [], 'onIntroShown'));
    }

    quizDataAvailable(data: QuizData) {
        this.onQuizDataAvailable.forEach(h => this.handle(h, [data], 'onQuizDataAvailable'));
    }

    introHidden() {
        this.onIntroHidden.forEach(h => this.handle(h, [], 'onIntroHidden'));
    }

    questionsShown() {
        this.onQuestionsShown.forEach(h => this.handle(h, [], 'onQuestionsShown'));
    }

    nextQuestion(questionIndex: number, questionViewIndex: number, isLast: boolean) {
        this.onNextQuestion.forEach(h => this.handle(h, [questionIndex, questionViewIndex, isLast], 'onNextQuestion'));
    }

    answer(isCorrect: boolean, answerIndex: number, questionIndex: number, questionViewIndex: number) {
        this.onAnswer.forEach(h => this.handle(h, [isCorrect, answerIndex, questionIndex, questionViewIndex], 'onAnswer'));
    }

    questionsHidden() {
        this.onQuestionsHidden.forEach(h => this.handle(h, [], 'onQuestionsHidden'));
    }

    resultShown(resultIndex: number, totalQuestions: number, answersMatched: number) {
        this.onResultShown.forEach(h => this.handle(h, [resultIndex, totalQuestions, answersMatched], 'onResultShown'));
    }

    resultHidden() {
        this.onResultHidden.forEach(h => this.handle(h, [], 'onResultHidden'));
    }

    reset() {
        this.onReset.forEach(h => this.handle(h, [], 'onReset'));
    }

    private handle(handler: EventHandler, args: any[], eventName: string) {
        switch (handler.kind) {
            case 'Behavior Custom Trigger':
                global.behaviorSystem.sendCustomTrigger(handler.customTrigger);
                break;
            case 'Behavior Script':
                handler.behaviorScript.trigger();
                break;
            case 'Script method':
                try {
                    handleCustomScript(handler, args, eventName);
                } catch (cause) {
                    if (!this.suppressScriptErrors) {
                        throw cause;
                    } else {
                        log('Error: ' + cause + '\n' + cause.stack);
                    }
                }
                break;
            default:
                const kind: never = handler.kind;
                throw new Error(`Handling not implemented for handler type ${kind}`);
        }
    }

}

function handleCustomScript(handler: EventHandler, args: any[], eventName: string) {
    const target = handler.onApi ? (handler.script as any).api : handler.script;
    if (!target) {
        throw new Error(`Script parameter is not specified for a handler of '${eventName}' quiz lifecycle event.`);
    }
    const method = target[handler.methodName];
    if (typeof method !== 'function') {
        const scriptLocation = handler.script.getSceneObject().name;
        if (method == null) {
            throw new Error(`There is no method ${handler.methodName} on script at ${scriptLocation} to handle '${eventName}' quiz lifecycle event.`);
        } else {
            throw new Error(`There is property ${handler.methodName} on script at ${scriptLocation}, but it's a ${typeof method} instead of function.`);
        }
    }
    method.call(target, ...args);
}
