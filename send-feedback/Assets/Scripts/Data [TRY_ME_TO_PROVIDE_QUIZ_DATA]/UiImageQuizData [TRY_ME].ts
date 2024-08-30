@typedef
class ImageQuestionDescription {
    @input
    @widget(new TextAreaWidget())
    readonly question: string;
    @input readonly answers: Texture[];
}

@typedef
class QuestionPattern {
    @input('int', '0') readonly questionIndex: number;
    @input('int[]') readonly matchingAnswers: number[];
}

@typedef
class UiResultDescription {
    @input
    @widget(new TextAreaWidget())
    readonly text: string;
    @input('int') readonly sceneIndex: number;
    @input readonly matchingAnswers: QuestionPattern[];
}

@component
export class UiImageQuizData extends BaseScriptComponent implements IQuizDataSource {
    @input
    @label('Dummy input, ignore me.')
    private readonly _dummy1: QuestionPattern;

    @input private readonly questions: ImageQuestionDescription[];
    @input private readonly results: UiResultDescription[];

    private data: QuizData;

    onAwake() {
        const questions: QuestionDescription[] = this.questions;
        const results: ResultDescription[] = this.results.map(r => {
            const result = {
                text: r.text,
                scene: r.sceneIndex,
            };
            r.matchingAnswers.forEach(({ questionIndex, matchingAnswers }) => {
                result[questionIndex + ''] = matchingAnswers;
            });
            return result;
        });
        this.data = { questions, results };
    }

    getQuizData(): Promise<QuizData> {
        return Promise.resolve(this.data);
    }
}
