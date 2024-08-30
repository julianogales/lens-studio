// TitlController.js
// Description: this script is responsible for tilting a set of screen 
// transforms and a material based on the rotation of a head component. 
// It calculates the tilt angle based on the head rotation and updates 
// the rotations of screen transforms and the tilt angle of the material accordingly.

//@input Asset.Material tiltMaterial
//@input Component.Head head
//@input Component.ScreenTransform[] transforms

const Z = vec3.back();


script.createEvent("UpdateEvent").bind(update);

/**
 * Update function to calculate tilt angle and update screen transforms and material tilt.
 */
function update() {
    const angle = -getAngle(script.head);
    const rotation = quat.angleAxis(angle, Z);
    setStRotations(script.transforms, rotation);
    setMaterialTilt(script.tiltMaterial, angle);
}

/**
 * Set rotations for an array of screen transforms.
 * @param {Component.ScreenTransform[]} sts - Array of screen transforms.
 * @param {quat} rot - Quaternion rotation.
 */
function setStRotations(sts, rot) {
    sts.forEach((st) => {
        if (st) {
            st.rotation = rot;
        } 
    });
}
/**
 * Set material tilt angle.
 * @param {Asset.Material & {mainPass: TiltPass}} material - Material to tilt.
 * @param {number} angle - Tilt angle in radians.
 */
function setMaterialTilt(material, angle) {
    material.mainPass.angle = -angle;
}

/**
 * Get the tilt angle based on the head rotation.
 * @param {Component.Head} head - Head component.
 * @returns {number} - Tilt angle in radians.
 */
function getAngle(head) {
    return Math.asin(head.getTransform().getLocalRotation().z) * 2;
}

