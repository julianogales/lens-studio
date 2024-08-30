import { log } from './Modules/Utils';
import { StageController } from './StageController';
import { Lifecycle } from './Lifecycle';

type State = 'intro' | 'questions' | 'results';

/**
 * Manages high-level logic of the quiz.
 *
 * Each quiz consists of three stages:
 * 1. Intro -- user can see what the quiz is about and decide whether they wish to participate.
 * 2. Questions -- questions are presented to the user in some order, and user answers them until some criteria is met.
 * 3. Results -- based on the answers given, the user is presented with some result, like a text description and visual decorations.
 *
 * After user is presented with the result, or are answering questions, they may wish to restart quiz,
 * this will switch current state to Questions starting from the first question.
 *
 * Most quizzes continue until the provided {@link IQuestionsController|questionsController} indicates there is no more questions,
 * but it's not required. For example, you may add a script that listens for the answers and terminates the quiz
 * by calling {@link QuizController.showResults()} after the first incorrect one.
 *
 * The most significant events in the lifecycle of the quiz may be observed by adding listeners in the {@link Lifecycle} script
 * in the form of Behavior triggers, or calling script methods, the later is more useful for some events, since they carry additional
 * data such as a question index, an answer index, a question view index, whether the answer was correct,
 * whether this is the last question, or the shown result index.
 */
@component
export class QuizController extends BaseScriptComponent {
    @input private readonly answersParent: SceneObject;
    @input private readonly answersPrefab: ObjectPrefab;

    @input('Component.ScriptComponent')
    private readonly questionSource: IQuizDataSource;

    @input('Component.ScriptComponent')
    private readonly questionsController: IQuestionsController;

    @input('Component.ScriptComponent')
    private readonly resultsController: IResultsController;

    @input
    private readonly stageController: StageController;

    @input
    private readonly lifecycle: Lifecycle;

    @input('float', '0')
    private readonly delayBeforeNextQuestion: number;

    private readonly nextQuestionDelay = this.createEvent('DelayedCallbackEvent');

    private picker: IAnswerPicker;
    private state: State = null;
    private quizData: QuizData = null;
    private answersSo: SceneObject = null;

    onAwake() {
        this.answersSo = this.answersPrefab.instantiate(this.answersParent);
        this.answersSo.enabled = true;
        this.picker = this.answersSo.getComponent('Component.ScriptComponent') as any;
        this.picker.onReady.push(() => this.nextQuestionDelay.reset(this.delayBeforeNextQuestion));
        this.picker.onAnswer.push((picker, answer) => this.recordAnswer(this.questionsController.currentQuestion, answer));
        this.answersSo.enabled = false;

        this.questionSource.getQuizData()
            .then(qd => {
                this.quizData = qd;
                this.lifecycle.quizDataAvailable(qd);

                log('Question data ready: ' + qd.questions.length + ' questions and ' + qd.results.length + ' results.');
                this.questionsController.setQuestions(qd.questions);
                this.resultsController.setResults(qd.results);
            })
            .catch(e => log('Error: ' + e + '\n' + e.stack));

        this.cleanupState('questions');
        this.cleanupState('results');
        this.updateState('intro');
        this.nextQuestionDelay.bind(() => this.nextQuestion());
    }

    public reset() {
        this.questionsController.reset();
        this.resultsController.reset();
        this.lifecycle.reset();
        this.transitionTo('questions');
    }

    public askQuestions() {
        this.transitionTo('questions');
    }

    public showResults() {
        this.transitionTo('results');
    }

    public recordAnswer(q: number, a: number) {
        log('Recorded answer ' + a + ' for question ' + q + '.');
        const correctIdx = this.quizData.questions[q].correctIdx;
        const isCorrect = typeof correctIdx === 'number' ? correctIdx == a : null;
        this.resultsController.recordAnswer(q, a);
        this.lifecycle.answer(isCorrect,
            a,
            q,
            this.questionsController.currentQuestionView);
    }

    public nextQuestion(): boolean {
        if (this.state != 'questions') return;
        this.answersSo.enabled = true;
        const hasNext = this.questionsController.nextQuestion();
        const currentQuestion = this.questionsController.currentQuestion;
        const currentQuestionView = this.questionsController.currentQuestionView;
        if (hasNext) {
            const question = this.quizData.questions[currentQuestion];
            this.picker.setAnswers(question.answers, question.correctIdx);
            this.picker.enable();
            this.lifecycle.nextQuestion(currentQuestion,
                currentQuestionView,
                this.questionsController.hasNext);
        } else {
            this.showResults();
        }

        return hasNext;
    }

    public get currentQuestion(): number {
        return this.questionsController.currentQuestion;
    }

    public get currentQuestionView(): number {
        return this.questionsController.currentQuestionView;
    }

    private transitionTo(state: State) {
        log('Quiz state transition: ' + this.state + '->' + state);
        this.cleanupState(this.state);
        this.updateState(state);
    }

    private updateState(state: State) {
        this.state = state;
        switch (state) {
            case 'intro':
                this.stageController.showIntro();
                this.lifecycle.introShown();
                break;
            case 'questions':
                this.answersSo.enabled = true;
                this.stageController.showQuestions();
                this.nextQuestion();
                this.picker.reset();
                this.lifecycle.questionsShown();
                break;
            case 'results':
                this.stageController.showResults();
                const { resultIdx, resultScore, questionsAsked } = this.resultsController.showResults();
                this.lifecycle.resultShown(resultIdx, questionsAsked, resultScore);
                break;
        }
    }

    private cleanupState(state: State) {
        switch (state) {
            case 'intro':
                this.lifecycle.introHidden();
                break;
            case 'questions':
                this.answersSo.enabled = false;
                this.questionsController.reset();
                this.lifecycle.questionsHidden();
                break;
            case 'results':
                this.resultsController.reset();
                this.lifecycle.resultHidden();
                break;
        }
    }

}
