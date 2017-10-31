var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();


let audioBlob = null;
let recorder = null;

let audioInterface = {};

audioInterface.initialize = function (successCallback, errorCallback) {
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

                recorder.startRecording();

                if (successCallback) {
                    successCallback();
                }

                recorder.onComplete = function (recorder, blob) {
                    audioBlob = blob;
                };

            },

            // Error callback
            function (err) {
                console.log('The following gUM error occured: ' + err);
                errorCallback('Unable to record audio due to insufficient permissions. In order to post, try granting this page microphone permissions or accessing the application over https');
                // console.log(errorCallback);

                // if (errorCallback) {
                //     errorCallback();
                // }
            }
        );
    } else {
        // if (errorCallback) {
        //     errorCallback();
        // }
        console.log('getUserMedia not supported on your browser!');
        errorCallback('Media recording not supported on this browser. Try using a supported browser, such as Chrome.')
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


