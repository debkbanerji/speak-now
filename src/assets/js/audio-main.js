// let AudioContext = window.AudioContext || window.webkitAudioContext;
//
// let audioCtx = new AudioContext();
//
// let oscillator = audioCtx.createOscillator();
// let gainNode = audioCtx.createGain();
//
//
// oscillator.connect(gainNode);
// gainNode.connect(audioCtx.destination);
//
// // oscillator.context;
// // oscillator.numberOfInputs;
// // oscillator.numberOfOutputs;
// // oscillator.channelCount;

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
// var mute = document.querySelector('.mute');


let audioBlob = null;
let recorder = null;

let audioInterface = {};

audioInterface.initialize = function () {
    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            // constraints - only audio needed for this app
            {
                audio: true
            },

            // Success callback
            function (stream) {
                const source = audioCtx.createMediaStreamSource(stream);
                console.log(source);
                source.connect(gainNode);
                // gainNode.connect(audioCtx.destination);


                recorder = new WebAudioRecorder(gainNode, {});

                recorder.onComplete = function (recorder, blob) {
                    // console.log(blob);
                    audioBlob = blob;
                };

                // recorder.startRecording();

                // setTimeout(function () {
                //     //do what you need here
                //     console.log(recorder.isRecording());
                //     recorder.finishRecording()
                // }, 7000);
            },

            // Error callback
            function (err) {
                console.log('The following gUM error occured: ' + err);
            }
        );
    } else {
        console.log('getUserMedia not supported on your browser!');
    }
};

audioInterface.startRecording = function () {
    recorder.startRecording();
};

audioInterface.finishRecording = function () {
    recorder.finishRecording();
};

audioInterface.isRecording = function () {
    return recorder.isRecording();
};

// if ((navigator.mediaDevices !== null) && (navigator.mediaDevices.getUserMedia !== null)) {
//     navigator.mediaDevices.getUserMedia(constraint).then(onGotAudioIn)["catch"](function(err) {
//         return onError("Could not get audio media device: " + err);
//     });
// } else {
//     navigator.getUserMedia(constraint, onGotAudioIn, function() {
//         return onError("Could not get audio media device: " + err);
//     });
// }


