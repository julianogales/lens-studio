import { TweenWrapper } from '../Modules/TweenWrapper';
import { textOpacity } from '../Modules/Utils';

/**
 * A simple animated text that uses different Text components depending on the text length.
 */
@component
export class QuestionView extends BaseScriptComponent implements IFadeText {
    @input('float', '0.3') private readonly fadeInDuration: number;
    @input('float', '0.3') private readonly fadeOutDuration: number;

    @input private readonly biggerText: Text;
    @input private readonly smallerText: Text;

    @ui.label('Thresholds for using smaller text')
    @input('int', '4') private readonly linesThreshold: number;
    @input('int', '20') private readonly lineLengthThreshold: number;

    private tweenIn: TweenWrapper<{ t: number }>;
    private tweenOut: TweenWrapper<{ t: number }>;

    private activeText: Text;

    onAwake() {
        this.activeText = this.biggerText;
        this.biggerText.enabled = false;
        this.smallerText.enabled = false;

        const animateText = t => textOpacity(this.activeText, t);
        this.tweenIn = tweenIn(this.getSceneObject(), this.fadeInDuration, animateText);
        this.tweenOut = tweenOut(this.getSceneObject(), this.fadeOutDuration, animateText);
        this.tweenIn.resetToStart();
    }

    public setText(value: string): void {
        this.forceHide();
        this.activeText = this.shouldUseSmallTextFor(value)
            ? this.smallerText
            : this.biggerText;
        this.activeText.enabled = true;
        this.activeText.text = value;
    }

    public forceHide() {
        this.biggerText.enabled = false;
        this.smallerText.enabled = false;
    }

    public fadeIn() {
        this.tweenIn.start();
    }

    public fadeOut() {
        this.tweenOut.start();
    }

    private shouldUseSmallTextFor(value: string): boolean {
        const lines = value.trim().split('\n');
        const longestLine = Math.max(...lines.map(l => l.trim().length));
        return lines.length >= this.linesThreshold || longestLine >= this.lineLengthThreshold;
    }
}

function tweenIn(so: SceneObject, duration: number, onUpdate: (t: number) => void): TweenWrapper<{ t: number }> {
    const result = new TweenWrapper({ t: 0 }, { t: 1 }, duration);
    result.tween
        .easing(global.TWEEN.Easing.Quadratic.In)
        .onStart(() => so.enabled = true)
        .onUpdate(({ t }) => onUpdate(t));
    return result;
}

function tweenOut(so: SceneObject, duration: number, onUpdate: (t: number) => void): TweenWrapper<{ t: number }> {
    const result = new TweenWrapper({ t: 1 }, { t: 0 }, duration);
    result.tween
        .easing(global.TWEEN.Easing.Quadratic.Out)
        .onStart(() => so.enabled = true)
        .onUpdate(({ t }) => onUpdate(t))
    ;
    return result;
}
