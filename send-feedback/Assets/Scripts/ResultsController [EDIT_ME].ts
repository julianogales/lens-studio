import { log } from './Modules/Utils';

type Tiebreak = 'first' | 'random';

/**
 * Picks the final result to show.
 *
 * For each answer each result is checked if it matches this answer for this question, if so -- a point awarded to the result.
 * In the end results having the highest score are selected. If it's only one -- it's shown, otherwise it's a tie,
 * which is resolved either by selected tiebreak strategy, or by finding a range defined by the `ceil` property in result descriptions.
 * If the results description in quiz data has `ceil` property -- will use it to find the one result if multiple has the same score:
 * 1. Results with the same scores are sorted by ascending ceil property.
 * 2. The first result with `ceil` higher than result score is taken.
 */
@component
export class ResultsController extends BaseScriptComponent implements IResultsController {
    @input('Component.ScriptComponent')
    private readonly decorationsController: IDecorationsController;

    @input('string', 'first')
    @widget(new ComboBoxWidget()
        .addItem('first')
        .addItem('random'))
    private readonly tiebreaker: Tiebreak;

    @input
    @allowUndefined
    private readonly resultsParent: SceneObject;

    @input
    private readonly resultPrefabs: ObjectPrefab[];

    private questionCounter = 0;
    private resultsCounters: number[];
    private useBuckets: boolean;

    private results?: ResultDescription[];
    private displayedResultText?: IFadeText = null;

    public setResults(results: ResultDescription[]) {
        this.results = results;
        this.resultsCounters = Array(results.length).fill(0);
        this.questionCounter = 0;
        this.useBuckets = typeof results[0].ceil === 'number';
    }

    public reset() {
        this.questionCounter = 0;
        this.resultsCounters?.fill(0);
        this.decorationsController.reset();
        this.displayedResultText?.forceHide?.();
    }

    public showResults(): Result {
        const best = bestResults(this.resultsCounters);
        log('Best results indices are : ' + best);
        log('Counts: ' + this.resultsCounters);
        const contestants = this.matchingBucket(best);
        let finalResultIdx: number;
        if (contestants.length > 1) {
            finalResultIdx = this.tiebreak(contestants);
        } else {
            finalResultIdx = contestants[0];
        }
        this.showResultsView(finalResultIdx);
        return {
            resultIdx: finalResultIdx,
            resultScore: this.resultsCounters[finalResultIdx],
            questionsAsked: this.questionCounter
        };
    }

    public recordAnswer(q: number, a: number) {
        this.questionCounter++;
        this.results.forEach((r, idx) => {
            if (matches(q, a, r)) {
                this.resultsCounters[idx]++;
            }
        });
    }

    private matchingBucket(resultsIndices: number[]): number[] {
        if (this.useBuckets) {
            // assumption: they all have equal score at this point
            const matchedAnswersCount = this.resultsCounters[resultsIndices[0]];
            const sorted = resultsIndices
                .filter((i) => !isNaN(this.results[i].ceil) && matchedAnswersCount <= this.results[i].ceil)
                .sort((l, r) => this.results[l].ceil - this.results[r].ceil);
            if (sorted.length == 0) return [];
            const min = this.results[sorted[0]].ceil;
            return sorted.filter((r) => this.results[r].ceil == min);
        } else {
            return resultsIndices;
        }
    }

    private tiebreak(results: number[]): number {
        if (results.length > 1) {
            if (this.useBuckets) {
                log('This is victorine (result.ceil is a number), will use first matching result');
                return results[0];
            } else {
                log(`Multiple results match, will use '${this.tiebreaker}' tiebreaker.`);
                if (this.tiebreaker === 'random') {
                    return results[Math.floor(MathUtils.randomRange(0, results.length))];
                } else {
                    return results[0];
                }
            }
        }
        if (results.length == 0) {
            throw new Error('No result matches!');
        }

        log('Only one result matches.');
        return results[0];
    }

    private showResultsView(resultIdx: number): number {
        const result = this.results[resultIdx];
        const text = substituteResultTemplate(result.text, this.questionCounter, this.resultsCounters[resultIdx]);
        const sceneIdx = result.scene;
        log(`Final result is ${resultIdx}: '${text}' with scene ${sceneIdx}`);
        const prefab = this.resultPrefabs[sceneIdx];
        if (prefab) {
            const resultSetterSo = prefab.instantiate(this.resultsParent);
            resultSetterSo.enabled = true;
            const resultText = getResultText(resultSetterSo, prefab, sceneIdx);
            resultText?.setText?.(text);
            resultText?.fadeIn?.();
            this.displayedResultText = resultText;

        } else {
            this.displayedResultText = null;
            log(`There is no prefab for the result scene ${sceneIdx}, nothing to instantiate.`);
        }
        this.decorationsController.showStageIdx(sceneIdx);
        return sceneIdx;
    }

}

function substituteResultTemplate(template: string, questionsAsked: number, answersMatched: number): string {
    return template
        .replace(/\{questionsAsked}/g, questionsAsked + '')
        .replace(/\{answersMatched}/g, answersMatched + '');
}

function matches(questionIdx: number, answerIdx: number, resultDesc: ResultDescription): boolean {
    const correctAnswer: number | number[] = resultDesc[questionIdx + ''];
    const matchesSingle = typeof correctAnswer === 'number' && correctAnswer === answerIdx;
    const matchesArray = Array.isArray(correctAnswer) && correctAnswer.indexOf(answerIdx) != -1;
    return matchesSingle || matchesArray;
}

function getResultText(resultSetterSo: SceneObject, prefab: ObjectPrefab, sceneIdx: number): IFadeText {
    const resultText: IFadeText & ScriptComponent = resultSetterSo.getComponent('ScriptComponent') as any;
    if (!resultText) {
        log(`There is not ScriptComponent on the prefab ${prefab.name} for scene ${sceneIdx},`
            + ' won\'t set the result text. Add a script to the root object of the prefab with'
            + ' methods setText, fadeIn and forceHide.');
    } else {
        const scriptName = resultText.toString();
        const description = `on script ${scriptName} in prefab ${prefab.name} for scene ${sceneIdx}`;
        if (!resultText.setText) {
            log(`There is no method \`setText\` ${description} won't set the result text.`);
        }
        if (!resultText.fadeIn) {
            log(`There is no method \`fadeIn\` ${description}, won't animate appearance.`);
        }
        if (!resultText.forceHide) {
            log(`There is no method \`forceHide\` ${description}, won't be able to hide it on reset.`);
        }
    }
    return resultText;
}

/**
 * @param {number[]} arr array of counters
 * @returns {number[]} array of indices that have maximum value (ideally only one, otherwise it's a tie)
 */
function bestResults(arr: number[]): number[] {
    if (arr.length < 1) return [];
    let max = arr[0];
    const results = [0];
    for (let i = 1; i < arr.length; ++i) {
        if (arr[i] > max) {
            max = arr[i];
            results.splice(0, results.length);
        }
        if (arr[i] == max) {
            results.push(i);
        }
    }
    return results;
}
