@typedef
class ImageQuestionDescription {
    @input
    @widget(new TextAreaWidget())
    readonly question: string;

    @input readonly answers: Texture[];

    @input('int')
    @label('Correct answer #')
    readonly correctIdx: number;
}

@typedef
class UiResultDescription {
    @input
    @widget(new TextAreaWidget())
    readonly text: string;

    @input('int')
    readonly sceneIndex: number;

    @input('int')
    readonly ceil: number;
}

@component
export class UiImageVictorineQuizData extends BaseScriptComponent implements IQuizDataSource {
    @input private readonly questions: ImageQuestionDescription[];

    @input private readonly results: UiResultDescription[];

    private data: QuizData;

    onAwake() {
        const questions: QuestionDescription[] = this.questions;
        const correctAnswers = questions.map(q => q.correctIdx);
        const results: ResultDescription[] = this.results.map(r => {
            const result = {
                text: r.text,
                scene: r.sceneIndex,
                ceil: r.ceil,
            };
            correctAnswers.forEach((a, q) => result[q + ''] = a);
            return result;
        });
        this.data = { questions, results };
    }

    getQuizData(): Promise<QuizData> {
        return Promise.resolve(this.data);
    }
}
