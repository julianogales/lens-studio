// MainLogic[State 3].js
// Description: this file provides functionality to randomly enable/disable groups of scene objects.

//@input SceneObject[] groups

const {randomSequence} = require("GlobalUtilities");

script.showNext = () => {
    setRandom();
    return Promise.resolve();
};

script.groups.forEach(disable);
const seq = randomSequence(script.groups);
let current = null;

// Function to set a random group as active.
function setRandom() {
    disable(current);
    enable(current = seq.next().value);
}


// Function to disable a scene object
function disable(elem) {
    if (elem) {
        elem.enabled = false; 
    }
}
// Function to enable a scene object
function enable(elem) {
    if (elem) {
        elem.enabled = true; 
    }
}


