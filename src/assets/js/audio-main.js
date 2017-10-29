var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();


let audioBlob = null;
let recorder = null;

let audioInterface = {};

audioInterface.initialize = function () {
    // audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // gainNode = audioCtx.createGain();
    audioBlob = null;
    recorder = null;
    if (navigator.getUserMedia) {
        navigator.getUserMedia(
            {
                audio: true
            },

            // Success callback
            function (stream) {
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(gainNode);


                recorder = new WebAudioRecorder(gainNode, {});

                recorder.onComplete = function (recorder, blob) {
                    audioBlob = blob;
                };

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

