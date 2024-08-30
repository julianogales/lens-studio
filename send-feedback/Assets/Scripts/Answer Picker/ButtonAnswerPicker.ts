import '../View/QuizButton';
import { QuizButton } from '../View/QuizButton';

@component
export class ButtonAnswerPicker extends BaseScriptComponent implements IAnswerPicker {
    public readonly onAnswer: ((picker: this, answer: number) => void)[] = [];
    public readonly onReady: ((picker: this) => void)[] = [];

    @input
    private readonly buttons: QuizButton[];
    private answered = false;
    private correctIdx?: number = null;
    private answersCount = 0;

    onAwake() {
        this.createEvent('OnStartEvent')
            .bind(() => this.buttons.forEach((b, i) => {
                b.onAction.push(() => this.answer(i));
                b.onDisarm.push(() => this.disarm());
            }));
    }

    public setAnswers(answers: string[] | Texture[], correctIdx: number = null) {
        this.correctIdx = correctIdx;
        if (answers && answers.length > 0) {
            const setter = typeof answers[0] == 'string'
                ? (button, i) => button.setText(answers[i])
                : (button, i) => button.setTexture(answers[i]);
            this.buttons.forEach((b, i) => {
                if (i < answers.length) {
                    setter(b, i);
                    b.fadeIn();
                } else {
                    if (this.answersCount == 0) {
                        // first question -- hide immediately
                        b.forceHide();
                    } else {
                        b.fadeOut();
                    }
                    b.disable();
                }
            });
        }
        this.answersCount = answers.length;
    }

    public enable(): void {
        this.answered = false;
        this.buttons.forEach((b, i) => {
            if (i < this.answersCount) {
                b.enable();
            }
            b.select();
            b.clearCorrectness();
        });
    }

    public reset() {
        this.buttons.forEach((b, i) => {
            if (i < this.answersCount) {
                b.enable();
            } else {
                b.disable();
            }
        });
    }

    private disarm(): void {
        if (this.answered) {
            this.trigger(this.onReady);
        }
    }

    private answer(a: number) {
        this.answered = true;
        this.trigger(this.onAnswer, a);
        this.buttons.forEach((b, i) => {
            b.disable();
            if (i >= this.answersCount) return;

            if (this.correctIdx === null) {
                b.clearCorrectness();
            } else {
                // correctness marks only on correct or answered, other are clear
                if (this.correctIdx === i) {
                    b.revealCorrect();
                } else {
                    if (i == a) {
                        b.revealIncorrect();
                    } else {
                        b.clearCorrectness();
                    }
                }
            }
            // if there are only 2 buttons -- highlight both, otherwise -- only picked
            if (i === a || (this.answersCount === 2 && this.correctIdx !== null)) {
                b.select();
            } else {
                b.deselect();
            }
        });
        if (a === this.correctIdx) {
            this.buttons[a].select();
        }
    }

    private trigger(cbs: ((picker: this, ...args: any[]) => void)[], ...args: any[]) {
        cbs.forEach(cb => cb(this, ...args));
    }
}
