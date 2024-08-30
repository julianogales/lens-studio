import { TweenWrapper } from '../Modules/TweenWrapper';
import { passOpacity, textOpacity } from '../Modules/Utils';

/**
 * Sets the result bubble text and animates its appearance.
 */
@component
export class ResultBubble extends BaseScriptComponent {
    @input private readonly text: Text;
    @input private readonly background: Image;

    @input('float', '0.3') private readonly fadeInDuration: number;
    @input('float', '0.3') private readonly fadeOutDuration: number;

    private readonly tweenIn: TweenWrapper<{ t: number }>;
    private readonly tweenOut: TweenWrapper<{ t: number }>;

    constructor() {
        super();
        const animateBubble = t => {
            textOpacity(this.text, t);
            passOpacity(this.background.mainPass, t);
        };
        this.tweenIn = tweenIn([this.text, this.background], this.fadeInDuration, animateBubble);
        this.tweenOut = tweenOut([this.text, this.background], this.fadeOutDuration, animateBubble);
        this.tweenIn.resetToStart();
    }

    public setText(value: string) {
        this.text.text = value;
    }

    public forceHide() {
        this.text.enabled = false;
        this.background.enabled = false;
    }

    public fadeIn() {
        this.tweenIn.start();
    }

    public fadeOut() {
        this.tweenOut.start();
    }

}

function tweenIn(elements: { enabled: boolean }[], duration: number, onUpdate: (t: number) => void): TweenWrapper<{ t: number }> {
    const result = new TweenWrapper({ t: 0 }, { t: 1 }, duration);
    result.tween
        .easing(global.TWEEN.Easing.Quadratic.In)
        .onStart(() => elements.forEach(e => e.enabled = true))
        .onUpdate(({ t }) => onUpdate(t));
    return result;
}

function tweenOut(elements: { enabled: boolean }[], duration: number, onUpdate: (t: number) => void): TweenWrapper<{ t: number }> {
    const result = new TweenWrapper({ t: 1 }, { t: 0 }, duration);
    result.tween
        .easing(global.TWEEN.Easing.Quadratic.Out)
        .onStart(() => elements.forEach(e => e.enabled = true))
        .onUpdate(({ t }) => onUpdate(t));
    return result;
}
