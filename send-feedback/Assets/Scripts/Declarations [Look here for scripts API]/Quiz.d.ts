/**
 * Provides Quiz setup, returns Promise, so it can be generated at runtime,
 * for example by calling some remote service, adapting questions for friends, etc.
 * The methods in interfaces declared here shouldn't throw errors.
 */

/** A script that can provide QuizData.*/
interface IQuizDataSource extends ScriptComponent{
    /** Get QuizData to use in the quiz. Since the result may be generated at runtime
     * (for example, based on remote API, or friends list), it's declared as a promise. */
    getQuizData(): Promise<QuizData>;
}

/** Full quiz configuration -- questions with answers and results with patterns of answers for each result. */
interface QuizData {
    questions: QuestionDescription[];
    results: ResultDescription[];
}

/**
 * Description of the single question with question text and possible answers.
 * There is also optional field for quizzes with correct answers.
 */
interface QuestionDescription {
    /** Text of the question. */
    question: string;
    /** List of the answers. May be null, if {@link IAnswerPicker|the answer picker} used supports it. */
    answers?: string[] | Texture[];
    /** Index of the correct answer if applicable. */
    correctIdx?: number;
}

/**
 * Single result description.
 * Exact result is selected by matching each of specified results to the list of given answers --
 * result that matches answers the best will be selected.
 * If there are multiple results that match answers with identical score -- tiebreaker is used in ResultsController.
 */
interface ResultDescription {
    /** Textual description of the result, for example "Introvert", "Extravert", "Your Love Language is Time Together", etc.*/
    text: string;
    /** Index of the scene to enable for this result, for example, you may tweak texts a little, but keep the same scene for some results. */
    scene: number;
    /**
     * For bucketed results, result with lowest `ceil` equal or greater than matched answers will be selected.
     * This allows for results to have the same answers pattern, but be selected based on number of matching answers.
     * For example, in a quiz with correct answers this can be used to give a grade -- correct answers are the same for all results,
     * but the one which has lowest 'ceil' value that is not less than matched answers will be selected.
     *
     * Tip: use ceil of high value (like 1000) for the highest score result, so you won't need to correct it when more questions are added.
     */
    ceil?: number;

    /**
     * A single or multiple answer indices matching this result.
     * This can also be omitted if some results are not interested in some questions.
     * @example "0": 1, "1": [0, 3], "2": 0, ...
     */
    [questionIndex: NumericString]: AnswerPattern,
}

/** String consisting of a number, like "1". */
type NumericString = `${number}`;

/** Result may match a single answer, or multiple different answers in the same question. */
type AnswerPattern = number[] | number;

/** A controller for text that can be changed, and appear/disappear with animation. */
interface IFadeText {

    /** Hide text instantly without any animation. */
    forceHide(): void;

    /** Set displayed text value. */
    setText(text: string): void;

    /** Animate appearance. */
    fadeIn(): void

    /** Animate disappearance. */
    fadeOut(): void
}

/** Abstraction over the logic to display questions. */
interface IQuestionsController {
    /** Index of the current question in QuestionDescription[] used in setQuestions. */
    readonly currentQuestion: number;

    /**
     * Index of the current question view (may be different than currentQuestion,
     * if questions viewed in different only or only from a subset)
     */
    readonly currentQuestionView: number;

    /** @returns true if the next call to {@link IQuestionsController.nextQuestion()} will succeed. */
    readonly hasNext: boolean;

    /** Set question descriptions to use. */
    setQuestions(questions: QuestionDescription[]): void;

    /**
     * Hide current question if it's shown, and show the next one if {@link IQuestionsController.hasNext|hasNext} was true.
     * @returns true if the next question was shown, false if there were no more questions to show.
     */
    nextQuestion(): boolean;

    /**
     * Hide displayed question and prepare for the next round of questions.
     * If question order is not well-defined, this should not preserve the order of the questions
     * in the last round.
     */
    reset(): void;
}


/** Data object describing shown result. */
interface Result {
    /** Index in ResultDescription array used to initialize the IResultController.*/
    resultIdx: number,
    /** Number of user answers matching this result. */
    resultScore: number,
    /** Number of questions asked and answered before the result was shown. */
    questionsAsked: number
}

/** Abstraction over logic to show the result based on answers given by the user. */
interface IResultsController {

    /** Set the ResultDescriptions to use for calculation and display. */
    setResults(results: ResultDescription[]): void;

    /** Process the user answer, so it can be used later in calculation of the final result. */
    recordAnswer(q: number, a: number): void;

    /** Calculate and display the result based on the answers given earlier. */
    showResults(): Result;

    /** Clear up answers given and hide displayed result, prepare for next questions round. */
    reset(): void;
}


/** Manages some groups of decorations (stages) based on the index. */
interface IDecorationsController {
    /** Hide the current stage if shown, and display stage with the specified index instead, if applicable. */
    showStageIdx(index: number): void;

    /** Hide all known decorations. */
    reset();
}

/** Abstraction over the answer selection method. */
interface IAnswerPicker {
    /** Called when this AnswerPicker is ready to be used again (displayed all animations, cooldowns passed, etc.)*/
    readonly onReady: ((picker: this) => void)[];
    /** Called when the user picks the answer. */
    readonly onAnswer: ((picker: this, answer: number) => void)[];

    /**
     * Set and display answer data.
     * @param answers answer data. Depending on the picker, this may have different types, you can introduce your own if necessary.
     * @param correctIdx index of the correct answer if applicable. null or undefined otherwise.
     */
    setAnswers(answers: string[] | Texture[], correctIdx?: number): void;

    /** Reset this answer picker to a state before the first question, for example, it may animate appearance or
     *  need to show hint for the first question.*/
    reset(): void;

    /** Allow picking answers. There may be external cooldown before the user can pick answer again, for example in
     * victorine quizzes we wait longer, so the user receives feedback on whether the answer was correct. */
    enable(): void;
}
