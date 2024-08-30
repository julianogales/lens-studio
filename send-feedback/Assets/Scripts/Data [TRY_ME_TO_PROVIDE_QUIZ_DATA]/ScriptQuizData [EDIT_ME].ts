@component
export class QuizDataSource extends BaseScriptComponent implements IQuizDataSource {
    @ui.label('This is an example of Quiz configured in script,\
edit the script to change the questions or results.')

    private readonly data: QuizData = {
            questions: [
                {
                    question: 'Question 1?',
                    // These won't be displayed in head picker example, but will be names for buttons if
                    // the button answer picker is used
                    answers: [
                        'No',
                        'Yes'
                    ]
                },
                {
                    question: 'Question 2?',
                    answers: [
                        'No',
                        'Yes'
                    ]
                },
                {
                    question: 'Question 3?',
                    answers: [
                        'No',
                        'Yes'
                    ],
                }
            ],
            results: [
                {
                // Text to be displayed in the result screen
                    text: 'Result 1: All No!',
                    // Scene to activate for this result
                    scene: 0,
                    // all questions answered "No"
                    '0': 0,
                    '1': 0,
                    '2': 0,
                }, {
                    text: 'Result 2: Yes, No, No',
                    scene: 1,
                    '0': 1,
                    '1': 0,
                    '2': 0,
                }, {
                    text: 'Result 3: No, Yes, No',
                    scene: 2,
                    // the second question answered "Yes", and all other answered "No"
                    '0': 0,
                    '1': 1,
                    '2': 0,
                }, {
                    text: 'Result 4: Yes, Yes, No',
                    scene: 3,
                    // the last question answered "No", and the first two answered "Yes"
                    '0': 1,
                    '1': 1,
                    '2': 0,
                }, {
                    text: 'Result 5: No, No, Yes',
                    scene: 3,
                    '0': 0,
                    '1': 0,
                    '2': 1,
                }, {
                // An example of a result that uses the same scene as the first one, but with different text
                    text: 'Result 6: Yes, No, Yes',
                    scene: 0,
                    '0': 1,
                    '1': 0,
                    '2': 1,
                }, {
                    text: 'Result 7: No, Yes, Yes',
                    scene: 1,
                    '0': 0,
                    '1': 1,
                    '2': 1,
                }, {
                    text: 'Result 8: All Yes!',
                    scene: 3,
                    // all questions answered "Yes"
                    '0': 1,
                    '1': 1,
                    '2': 1,
                },
            ]
        };

    // Promise is returned in case you want to create your own questions dynamically,
    // for example by accessing remote API, or tuning question for friends, while friends list
    // can only be received asynchronously
    public getQuizData(): Promise<QuizData> {
        return Promise.resolve(this.data);
    }
}
