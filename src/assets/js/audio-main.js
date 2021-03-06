var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();


let audioBlob = null;
let recorder = null;

let audioInterface = {};

audioInterface.initialize = function (successCallback, errorCallback) {
    audioBlob = null;
    recorder = null;
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(
            {
                audio: true
            }).then(
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

            }).catch(
            // Error callback
            function (err) {
                console.log('The following gUM error occured: ' + err);
                errorCallback('Unable to record audio due to insufficient permissions. In order to post, try granting this page microphone permissions or accessing it over https.');
            });
    } else {
        console.log('navigator.mediaDevices.getUserMedia not supported on your browser!');
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
    if (!recorder) {
        return false;
    }
    return recorder.isRecording();
};


