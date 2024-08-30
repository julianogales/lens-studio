export function getOrCreateComponent<K extends keyof ComponentNameMap>(so: SceneObject | null, componentType: K) {
    return so
        ? so.getComponent(componentType) || so.createComponent(componentType)
        : null;
}

export function passOpacity(pass: Pass, value: number) {
    const c = pass.baseColor;
    c.a = value;
    pass.baseColor = c;
}

export function textOpacity(text: Text, value: number) {
    fillOpacity(text.textFill, value);
    fillOpacity(text.outlineSettings.fill, value);
    fillOpacity(text.dropshadowSettings.fill, value * value);
}

export function fillOpacity(fill: TextFill, value: number) {
    const c = fill.color;
    c.a = value;
    fill.color = c;
}

export function enable(so: { enabled: boolean }) {
    if (so) {
        so.enabled = true;
    }
}

export function disable(so: { enabled: boolean }) {
    if (so) {
        so.enabled = false;
    }
}

export function log(msg: string) {
    const logger = (global as any).textLogger;
    if (!isNull(logger)) {
        logger.log(msg);
    } else if (global.deviceInfoSystem.isEditor()) {
        print(msg);
    } else {
        Studio.log(msg);
    }
}
