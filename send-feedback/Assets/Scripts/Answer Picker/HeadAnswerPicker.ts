import { TweenWrapper } from '../Modules/TweenWrapper';
import { getOrCreateComponent, log } from '../Modules/Utils';

type Tilt = 'undecided' | 'left' | 'right';

const ease = (x: number) => x * x * x;

interface SmileyPass extends Pass {
    /** In range 0..1 */
    confidence: number;
    /** In range 0..1 */
    opacity: number;
    /** In range 0..1 */
    waiting: number;
}

@component
export class HeadAnswerPicker extends BaseScriptComponent implements IAnswerPicker {
    public readonly onReady: ((picker: this) => void)[] = [];
    public readonly onAnswer: ((picker: this, answer: number) => void)[] = [];

    @input('float', '15.0')
    private readonly pickAngleDegrees: number;

    @input private readonly leftImage: Image;
    @input private readonly rightImage: Image;
    @input private readonly head: Head;

    @input('int', '1')
    private readonly leftAnswerValue: number;
    @input('int', '0')
    private readonly rightAnswerValue: number;

    @input('float', '2')
    private readonly initialPickDelay: number;
    @input('Component.ScriptComponent')
    @allowUndefined
    private readonly headHint?: IVisualDemonstration;

    @ui.group_start('Animation')
    @input('float', '0.3')
    private readonly buttonPressDuration: number;
    @input('float', '0.5')
    private readonly minOppositeOpacity: number;
    @ui.group_end
    private readonly pickThreshold: number;
    private readonly leftPass: SmileyPass;
    private readonly rightPass: SmileyPass;
    private readonly headTransform: Transform;
    private readonly updateEvent = this.createEvent('UpdateEvent');

    private readonly fadeIn: TweenWrapper<{ opacity: number }>;

    private armed = false;
    private canPick = false;

    private readonly resultValues: { readonly left: number, readonly right: number };

    constructor() {
        super();
        this.pickThreshold = this.pickAngleDegrees * MathUtils.DegToRad;
        this.leftPass = this.leftImage.mainPass as SmileyPass;
        this.rightPass = this.rightImage.mainPass as SmileyPass;
        this.headTransform = this.head.getSceneObject().getTransform();
        this.updateEvent.enabled = false;

        this.fadeIn = new TweenWrapper({ opacity: 0 }, { opacity: 1 }, this.initialPickDelay);
        this.fadeIn.tween.easing(global.TWEEN.Easing.Cubic.Out)
            .onUpdate((opObj) => this.leftPass.opacity = this.rightPass.opacity = opObj.opacity)
            .onComplete(() => {
                return this.armed = true;
            });

        this.resultValues = { left: this.leftAnswerValue, right: this.rightAnswerValue };

        this.updateEvent.bind(() => this.update());

        this.initTap();
    }

    public setAnswers(answers: string[] | Texture[]) {
        // no-op, using only smiles
    }

    public reset() {
        this.armed = false;
        this.updateEvent.enabled = true;
        this.canPick = this.updateRotation() == 'undecided';
        this.headHint?.show();
        this.leftPass.opacity = 0;
        this.rightPass.opacity = 0;
        this.fadeIn.reset().start();
    }

    public enable() {
        this.updateEvent.enabled = true;
    }

    private setResult(result: 'left' | 'right') {
        if (!this.canPick) return false;
        const resultValue = this.resultValues[result];
        this.onAnswer.forEach(c => c(this, resultValue));
        this.updateEvent.enabled = false;
        this.canPick = false;
        return true;
    }

    private update() {
        const result = this.updateRotation();
        if (result == 'undecided') {
            this.canPick = true;
        } else if (this.armed && this.setResult(result)) {
            this.onReady.forEach(c => c(this));
        }
    }

    private currentAngle() {
        return Math.asin(this.headTransform.getLocalRotation().z) * 2;
    }

    private updateRotation(): Tilt {
        const angle = this.currentAngle();
        this.animate(angle);
        if (angle > this.pickThreshold) {
            return 'left';
        } else if (angle < -this.pickThreshold) {
            return 'right';
        }
        return 'undecided';
    }

    private animate(angle: number) {
        const left = ease(MathUtils.clamp(MathUtils.remap(angle, 0, this.pickThreshold, 0, 1), 0, 1));
        const right = ease(MathUtils.clamp(MathUtils.remap(angle, 0, -this.pickThreshold, 0, 1), 0, 1));
        this.leftPass.confidence = left;
        this.rightPass.confidence = right;
        if (this.armed) {
            this.leftPass.opacity = MathUtils.remap(right, 1, 0, this.minOppositeOpacity, 1);
            this.rightPass.opacity = MathUtils.remap(left, 1, 0, this.minOppositeOpacity, 1);
        }
    }

    private initTap() {
        const tapTween = new TweenWrapper({ angle: 0 }, { angle: 0 }, this.buttonPressDuration / 2);
        tapTween.tween.easing(global.TWEEN.Easing.Cubic.Out)
            .onUpdate((params) => this.animate(params.angle))
            .onComplete((params) => {
                restore.params.from = params.angle;
                restore.params.t = 0;
                restore.start();
            });
        const restore = new TweenWrapper({ t: 0, from: 0 }, { t: 1 }, this.buttonPressDuration / 2);
        restore.tween.easing(global.TWEEN.Easing.Cubic.In)
            .onUpdate((params) => this.animate(MathUtils.lerp(params.from, this.currentAngle(), params.t)))
            .onComplete(() => this.onReady.forEach(c => c(this)));

        getOrCreateComponent(this.leftImage.getSceneObject(), 'InteractionComponent')
            .onTap.add(() => {
                if (this.setResult('left')) {
                    tapTween.params.angle = this.currentAngle();
                    tapTween.to.angle = this.pickThreshold;
                    tapTween.start();
                }
            });
        getOrCreateComponent(this.rightImage.getSceneObject(), 'InteractionComponent')
            .onTap.add(() => {
                if (this.setResult('right')) {
                    tapTween.params.angle = this.currentAngle();
                    tapTween.to.angle = -this.pickThreshold;
                    tapTween.start();
                }
            });
    }
}
