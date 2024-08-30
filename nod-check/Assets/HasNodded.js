// -----JS CODE-----
// @input Component.AudioComponent audioYes
// @input SceneObject fbxObject
// @input SceneObject instructions
// @input Asset.RemoteServiceModule remoteServiceModule


//------------------------------------- API ------------------------------------
function handleAPIResponse(response) {
  
    Studio.log('hello');
  if (response.statusCode !== 1) {
        
    print('ERROR: The API call did not succeed!. Please check your request');
        print(response.statusCode);
  } else {
        try {
        var parsedBody = JSON.parse(response.body);
        print(parsedBody);
        } catch (e) {
            print('ERROR: Failed to parse response');
        }
    }
}

//API call (remote service module)
function callRemoteService() {
  var req = global.RemoteApiRequest.create();
  req.endpoint = 'fact';

  script.remoteServiceModule.performApiRequest(req, function(response) {
    handleAPIResponse(response);
  });
}
//------------------------------------------------------------------------------


// Constants
var NodCountRequired = 2;
var NodAngularRequirement = 5;
var NodTimingRequirement = 0.75;
var DisappearDelay = 2.0;
var TextDelay = [0.1, 1.5];

// Variables
var nodInProgress = 0;
var lastSignificantNodAngle = 0;
var lastDigitalNod = 0;
var nodCount = 0;
var fbxAppearTimer = 0;
var fbxDisappearTimer = 0;
var instructionsDisappearTimer = 0;
var instructionsAppearTimer = 0;

// Initialize: Hide FBX object and instructions
if (script.fbxObject) {
    script.fbxObject.enabled = false;
}
if (script.instructions) {
    script.instructions.enabled = true;
}

function updateNodYes() {
    // Timeout
    if (nodInProgress > 0) {
        nodInProgress -= getDeltaTime();
        if (nodInProgress <= 0) {
            // Reset nod count and direction
            nodCount = 0;
            lastDigitalNod = 0;
        }
    }

    // How far up/down is your head?
    var headTransform = script.getSceneObject().getTransform();
    var forwardY = headTransform.forward.y;
    var angle = Math.asin(forwardY) * (180 / Math.PI);

    // Quantize and study this nod
    var nod = 0; // Neutral, +1 is up, -1 is down
    if (angle < lastSignificantNodAngle - NodAngularRequirement) {
        // Down
        nod = -1;
        lastSignificantNodAngle = angle;
    } 
    else if (angle > lastSignificantNodAngle + NodAngularRequirement) {
        // Up
        nod = +1;
        lastSignificantNodAngle = angle;
    }

    // We've gone up/down enough?
    if (nod != 0) {
        // And it was in a different direction than before
        if (nod != lastDigitalNod) {
            lastDigitalNod = nod;
            nodCount++;

            // Reset timing, we think you might still be nodding
            nodInProgress = NodTimingRequirement;

            if (nodCount >= NodCountRequired) {
                nodCount = 0;

                // Print confirmation msg to Logger
                print("User has nodded!");
                callRemoteService();

                if (script.audioYes) {
                    script.audioYes.play(1);
                }

                if (script.fbxObject) {
                    script.fbxObject.enabled = true;

                    fbxDisappearTimer = DisappearDelay;
                    instructionsDisappearTimer = TextDelay[0];
                }
            }
        }
    }

    // Update timers
    if (fbxDisappearTimer > 0) {
        fbxDisappearTimer -= getDeltaTime();
        if (fbxDisappearTimer <= 0) {
            script.fbxObject.enabled = false;

            instructionsAppearTimer = TextDelay[1];
        }
    }

    if (instructionsDisappearTimer > 0) {
        instructionsDisappearTimer -= getDeltaTime();
        if (instructionsDisappearTimer <= 0) {
            script.instructions.enabled = false;
        }
    }

    if (instructionsAppearTimer > 0) {
        instructionsAppearTimer -= getDeltaTime();
        if (instructionsAppearTimer <= 0) {
            script.instructions.enabled = true;
        }
    }
}

var event = script.createEvent("UpdateEvent");
event.bind(updateNodYes);