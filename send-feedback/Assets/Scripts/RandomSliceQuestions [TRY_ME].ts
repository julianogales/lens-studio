import { log } from './Modules/Utils';

/**
 * A questions controller, that displays only a part of questions in random order per round.
 * This is useful for quizzes with correct answers, so they are engaging to play multiple times.
 */
@component
export class RandomSliceQuestions extends BaseScriptComponent implements IQuestionsController {
    @ui.label('Aim for 3-10 questions per round')
    @input('int', '5') private readonly questionsPerRound: number;

    @input('Component.ScriptComponent')
    private readonly decorationsController: IDecorationsController;

    @input
    @hint('Prepend a line with an index of current question and a total number of questions')
    private readonly autonumerate: boolean;

    @input private readonly questionParent: SceneObject;
    @input private readonly questionPrefab: ObjectPrefab;

    private questions: QuestionDescription[];
    private questionSequence: Iterator<number, never>;
    private _currentQuestion = -1;
    private _currentQuestionView = -1;

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
        const text2: IFadeText = so2.getComponent('ScriptComponent') as any;

        this.doubleBuffer = [text1 as IFadeText, text2 as IFadeText];

        text1.forceHide();
        text2.forceHide();
    }

    public setQuestions(questions: QuestionDescription[]) {
        this.questions = questions;
        this.questionSequence = randomSequence(indices(questions));
    }

    public nextQuestion(): boolean {
        if (this._currentQuestionView >= this.questionsPerRound) {
            return false;
        }

        if (this._currentQuestion >= 0) {
            this.doubleBuffer[this.currentTextSetter].fadeOut();
            this.currentTextSetter = (this.currentTextSetter + 1) % this.doubleBuffer.length;
        }

        this._currentQuestionView++;
        this._currentQuestion = this.questionSequence.next().value;

        if (0 <= this._currentQuestionView && this._currentQuestionView < this.questionsPerRound) {
            this.decorationsController.showStageIdx(this._currentQuestionView);
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
        return this._currentQuestionView;
    }

    public get hasNext(): boolean {
        return (this._currentQuestionView + 1) < this.questionsPerRound;
    }

    public reset(): void {
        this._currentQuestion = -1;
        this._currentQuestionView = -1;
        this.decorationsController.reset();
        this.doubleBuffer[this.currentTextSetter].forceHide();
    }

    private numerate(text: string): string {
        return this.autonumerate
            ? (this._currentQuestionView + 1) + '/' + this.questionsPerRound + '\n' + text
            : text;
    }
}

// Shuffling
/**
 * Returns infinite sequence of items in random order without repetitions,
 * except when length items count is 1 then it will be the same element, or 2,
 * then it will be other element.
 * @template T
 * @param {T[]} items
 */
function* randomSequence<T>(items: T[]): Generator<T, never> {
    shuffle(items);
    let currentIdx = -1;
    while (true) {
        const last = items[currentIdx++];
        if (currentIdx >= items.length) {
            shuffle(items);
            currentIdx = 0;
        }
        let current = items[currentIdx];
        if (current === last && items.length > 1) {
            current = items[++currentIdx];
        }
        yield current;
    }
}

/** @returns {number} value in range [lo, hi) */
function randomInt(lo: number, hi: number): number {
    return Math.floor(MathUtils.randomRange(lo, hi));
}

/**
 * Durstenfeld-Knuth variation of Fisher–Yates unbiased in-place shuffle.
 * @template T
 * @param {T[]} arr array to shuffle in-place.
 * @param {number} [from=0] start position of partial shuffle
 * @param {number} [len=arr.length] length of partial shuffle
 */
function shuffle<T>(arr: T[], from: number = 0, len: number = arr.length): T[] {
    const to = Math.min(arr.length, from + len);
    for (let i = from; i < to - 1; ++i) {
        const swapWith = randomInt(i, arr.length);
        const tmp = arr[i];
        arr[i] = arr[swapWith];
        arr[swapWith] = tmp;
    }
    return arr;
}

/** @returns {number[]} array indices */
function indices(arr: any[]): number[] {
    return Array(arr.length).fill(0)
        .map((_, i) => i);
}
