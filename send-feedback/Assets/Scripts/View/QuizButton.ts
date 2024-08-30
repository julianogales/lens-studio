import { TweenWrapper } from '../Modules/TweenWrapper';
import { passOpacity, textOpacity } from '../Modules/Utils';

enum Correctness {
    None = -1,
    Incorrect = 0,
    Correct = 1,
}

interface CorrectnessPass extends Pass {
    confidence: -1 | 0 | 1;
}

interface ButtonPass extends Pass {
    confidence: -1 | 0 | 1,
    opacity: number
}

/**
 * A button that supports cancellation by swiping finger off the button, and also multiple states.
 *
 * The button can be:
 * armed -- user touches it;
 * disarmed -- no finger touches it;
 * selected -- default state, it's ready to be pressed, or was selected by the user for answer;
 * deselected -- faded, indicating that it wasn't selected for the answer;
 * correct -- indicates the correct answer by changing color and displaying a corresponding icon;
 * incorrect -- indicates that the answer was incorrect by changing color and displaying a corresponding icon;
 * neither correct nor incorrect -- this quiz is without correct answers
 *
 * Can display a text and/or image.
 */
@component
export class QuizButton extends BaseScriptComponent implements IFadeText {
    /** Triggers when the user confidently taps the button. */
    public readonly onAction: ((button: this) => void)[] = [];
    /** Triggers when the user releases the button without performing action (e.g. slides of the pressed button) */
    public readonly onCancel: ((button: this) => void)[] = [];
    /** Triggers when the button is pressed down, and press animation starts */
    public readonly onArm: ((button: this) => void)[] = [];
    /** Triggers when the last finger holding the button is released, independently on whether the action is performed */
    public readonly onDisarm: ((button: this) => void)[] = [];
    /** Triggers when selection/highlight animation starts */
    public readonly onSelected: ((button: this) => void)[] = [];
    /** Triggers when deselection animation starts */
    public readonly onDeselected: ((button: this) => void)[] = [];

    @input
    private readonly buttonContainer: ScreenTransform;

    @input
    @allowUndefined
    private readonly touchZoneOverride: ScreenTransform;

    @input
    private readonly interaction: InteractionComponent;

    @input
    private readonly background: Image;

    @input
    @allowUndefined
    private readonly text: Text;

    @input
    @allowUndefined
    private readonly image: Image;

    @input
    @allowUndefined
    private readonly correctnessIndicator: Image;

    @ui.group_start('Style')
    @ui.group_start('Armed button style')
    @input('float', '0.95') private readonly armedScale: number;
    @input('float', '0.15') private readonly armDuration: number;
    @ui.group_end

    @ui.group_start('Disarmed button style')
    @input('float', '1') private readonly disarmedScale: number;
    @input('float', '0.15') private readonly disarmDuration: number;
    @ui.group_end

    @ui.group_start('Selected button style')
    @input('float', '1') private readonly defaultOpacity: number;
    @input('float', '1') private readonly selectedOpacity: number;
    @input('float', '0.15') private readonly selectionDuration: number;

    @ui.group_end
    @ui.group_start('Deselected button style')
    @input('float', '0.55') private readonly deselectedOpacity: number;
    @input('float', '0.15') private readonly deselectionDuration: number;
    @ui.group_end
    @input('float', '0.15') private readonly fadeOutDuration: number;
    @ui.group_end

    private readonly bgPass: ButtonPass;
    private readonly imagePass?: ButtonPass;
    private readonly correctnessPass?: CorrectnessPass;

    // for multi-touch logic
    private readonly trackedTouches = new Map<number, vec2>();

    private readonly armTween: TweenWrapper<any>;
    private readonly disarmTween: TweenWrapper<any>;
    private readonly selectTween: TweenWrapper<any>;
    private readonly deselectTween: TweenWrapper<any>;

    private readonly fadeoutTween: TweenWrapper<any>;

    private isSelected: boolean = true;
    private isVisible: boolean = true;
    private interactable: boolean = true;

    constructor() {
        super();
        // We don't want to lose touch when button animates scale, so there should be a stable touch zone,
        // but if it isn't there -- fallback to container
        if (!this.touchZoneOverride) this.touchZoneOverride = this.buttonContainer;

        // clone passes, so we can tweak them independently in case they are reused
        this.background.mainMaterial = this.background.mainMaterial.clone();
        if (this.image) {
            this.image.mainMaterial = this.image.mainMaterial.clone();
        }
        if (this.correctnessIndicator) {
            this.correctnessIndicator.mainMaterial = this.correctnessIndicator.mainMaterial.clone();
        }

        this.bgPass = this.background.mainPass as ButtonPass;
        this.imagePass = this.image?.mainPass as ButtonPass;
        this.correctnessPass = this.correctnessIndicator?.mainPass as CorrectnessPass;
        this.interaction.onTouchStart.add((args) => this.onPress(args.touchId, args.position));
        this.interaction.onTouchEnd.add((args) => this.onRelease(args.touchId, args.position, false));

        this.disarmTween = new TweenWrapper({ t: 1 }, { t: 0 }, this.disarmDuration);
        this.disarmTween.tween.easing(global.TWEEN.Easing.Linear.None)
            .onStart(() => this.trigger(this.onDisarm))
            .onUpdate(({ t }) => this.tweenScale(t));
        this.armTween = new TweenWrapper({ t: 0 }, { t: 1 }, this.armDuration);
        this.armTween.tween.easing(global.TWEEN.Easing.Linear.None)
            .onStart(() => this.trigger(this.onArm))
            .onUpdate(({ t }) => this.tweenScale(t));
        this.selectTween = new TweenWrapper({ t: 0 }, { t: 1 }, this.selectionDuration);
        this.selectTween.tween.easing(global.TWEEN.Easing.Linear.None)
            .onStart(() => this.trigger(this.onSelected))
            .onUpdate(({ t }) => this.tweenOpacity(t));
        this.deselectTween = new TweenWrapper({ t: 0 }, { t: 1 }, this.deselectionDuration);
        this.deselectTween.tween.easing(global.TWEEN.Easing.Linear.None)
            .onStart(() => this.trigger(this.onDeselected))
            .onUpdate(({ t }) => this.tweenOpacity(t));
        this.fadeoutTween = new TweenWrapper({ t: 1 }, { t: 0 }, this.fadeOutDuration);
        this.fadeoutTween.tween.easing(global.TWEEN.Easing.Linear.None)
            .onUpdate(({ t }) => this.tweenOpacity(t));
    }

    public setText(value: string) {
        if (this.text) {
            this.text.text = value;
        }
    }

    public setTexture(value: Texture) {
        if (this.image) {
            this.image.mainPass.baseTex = value;
        }
    }

    public select() {
        if (this.isSelected) return;
        this.isSelected = true;
        this.selectTween.reset().start();
    }

    public deselect() {
        if (!this.isSelected) return;
        this.isSelected = false;
        this.deselectTween.reset().start();
    }

    public clearCorrectness() {
        this.bgPass.confidence = Correctness.None;
        if (this.correctnessPass) {
            this.correctnessPass.confidence = Correctness.None;
        }
    }

    public revealCorrect() {
        this.bgPass.confidence = Correctness.Correct;
        if (this.correctnessPass) {
            this.correctnessPass.confidence = Correctness.Correct;
        }
    }

    public revealIncorrect() {
        this.bgPass.confidence = Correctness.Incorrect;
        if (this.correctnessPass) {
            this.correctnessPass.confidence = Correctness.Incorrect;
        }
    }

    public fadeOut() {
        if (!this.isVisible) return;
        this.isVisible = false;
        this.fadeoutTween.start();
    }

    public fadeIn() {
        if (this.isVisible) return;
        this.isVisible = true;
        if (this.isSelected) {
            this.selectTween.start();
        } else {
            this.deselectTween.start();
        }
    }

    public forceHide() {
        this.isVisible = false;
        this.tweenOpacity(0);
    }

    public enable() {
        this.interactable = true;
        this.interaction.enabled = true;
    }

    public disable() {
        this.interactable = false;
        this.interaction.enabled = false;
    }

    private onPress(touchId: number, position: vec2) {
        if (!(this.interactable && this.touchZoneOverride.containsScreenPoint(position))) return;
        if (this.trackedTouches.size == 0) {
            this.trigger(this.onArm);
            this.armTween.tween.onComplete(null);
            this.armTween.reset().start();
        }
        this.trackedTouches.set(touchId, position);
    }

    private onRelease(touchId: number, position: vec2, isCancelled: boolean) {
        if (isCancelled || !this.interactable) {
            this.cancelTouch(touchId);
            return;
        }
        if (!this.touchZoneOverride.containsScreenPoint(position)) {
            this.cancelTouch(touchId);
            return;
        }

        if (this.cancelTouch(touchId)) {
            if (this.trackedTouches.size == 0) {
                this.trigger(this.onAction);
            }
        } else {
            this.trigger(this.onCancel);
        }
    }

    private release() {
        if (this.trackedTouches.size == 0) {
            if (this.armTween.tween.isPlaying()) {
                this.armTween.tween.onComplete(() => this.disarmTween.reset().start());
            } else {
                this.disarmTween.reset().start();
            }
        }
    }

    private cancelTouch(touchId: number) {
        if (this.trackedTouches.delete(touchId)) {
            this.release();
            return true;
        }
        return false;
    }

    private tweenOpacity(t: number) {
        const from = this.isVisible ? this.defaultOpacity : 0;
        const to = this.isSelected ? this.selectedOpacity : this.deselectedOpacity;
        const opacity = MathUtils.lerp(from, to, t);
        this.bgPass.opacity = opacity;
        if (this.text) textOpacity(this.text, opacity);
        if (this.imagePass && this.imagePass.baseColor != null) passOpacity(this.imagePass, opacity);
        if (this.isSelected && typeof this.correctnessPass.opacity === 'number') {
            this.correctnessPass.opacity = opacity;
        }
    }

    private tweenScale(t: number) {
        const scale = MathUtils.lerp(this.disarmedScale, this.armedScale, t);
        const scaleVec = this.buttonContainer.scale;
        scaleVec.x = scale;
        scaleVec.y = scale;
        scaleVec.z = scale;
        this.buttonContainer.scale = scaleVec;
    }

    private trigger(cbs: ((button: this) => void)[]) {
        cbs.forEach(cb => cb(this));
    }
}
