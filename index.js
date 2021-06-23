let camera_button = document.querySelector("#start-camera");
let video = document.querySelector("#video");
let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");
let download_link = document.querySelector("#download-video");


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    // navigator.getUserMedia =
//   navigator.getUserMedia ||
//   navigator.webkitGetUserMedia ||
//   navigator.mozGetUserMedia ||
//   navigator.msGetUserMedia;
// if (navigator.getUserMedia) {
//   navigator.getUserMedia(
//     {
//       audio: false,
//       video: true,
//     },
//     function () {
//         webcam()
//     },
//     function (e) {
//       console.log("Already using camera!!");
//     }
//   );
// }

// function webcam(){
//     video = document.querySelector(".videoPreview");

//     var successCallback = function (stream) {
//       video.src = stream;
//     };
//     var errorCallback = function (error) {
//       if (error.name == "NotAllowedError") {
//         alert("Please allow access to the camera");
//         navigator.mediaDevices
//           .getUserMedia({ video: true, audio: false })
//           .then(successCallback, errorCallback);
//       }
//     };
//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: false })
//       .then(successCallback, errorCallback);
// }
// const hdConstraints = {
//     video: { width: { min: 1280 }, height: { min: 720 } },
//   };
  
//   navigator.mediaDevices.getUserMedia(hdConstraints).then((stream) => {
//     video.srcObject = stream;
//   });

// // Grab elements, create settings, etc.
// var video = document.getElementById('video');

// Get access to the camera!
if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
        //video.src = window.URL.createObjectURL(stream);
        video.srcObject = stream;
        window.stream = stream;
        video.play();
    });
}
  }else{
    // false for not mobile device
    alert("Please open the link in mobile device");
  }

var startRecordingButton = false;


 
  function startRecording() {
    recordedBlobs = [];
    let options = {mimeType: 'video/webm;codecs=vp9,opus'};
    
    try {
      mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
      return;
    }
  
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
      console.log('Recorded Blobs: ', recordedBlobs);
    };
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    console.log('MediaRecorder started', mediaRecorder.state);
    startTimerForRecording();
  }
  
  function stopRecording() {
    mediaRecorder.stop();
    $("#start-record").html(`Start`)
    
  }

  function cancelRecording(){
    mediaRecorder.stop();
    recordedBlobs = [];
    $("#start-record").html(`Start`)
    $("#TimerForCapture").css('display', 'none')
    clearInterval(timerForRecording)
  }

var downloadButton = document.querySelector('#download-video')
  downloadButton.addEventListener('click', () => {
    const blob = new Blob(recordedBlobs, {type: 'video/mp4'});
    const url = window.URL.createObjectURL(blob);
    var fd = new FormData();
    fd.append('video', blob)
    console.log(fd, "----------------------")
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.mp4';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  });

  function handleDataAvailable(event) {
    console.log('handleDataAvailable', event);
    if (event.data && event.data.size > 0) {
      recordedBlobs.push(event.data);
    }
  }
var timerForRecording;
  function startTimerForRecording(){
    
    var count = 0;
      timerForRecording = setInterval(function(){
        count++
        $("#TimerForCapture").html("<span>"+count+"</span>")
        $("#TimerForCapture").css('display', 'flex')
        $("#start-record").html(`${loadingIcon}  Recording`)
        
        console.log(count)
        if(count>10){
        clearInterval(timerForRecording)
        stopRecording()
        $("#TimerForCapture").css('display', 'none')
      }
      }, 1000)
      
  }


var loadingIcon = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgba(241, 242, 243, 0); display: block; shape-rendering: auto;" width="31px" height="31px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
<circle cx="50" cy="50" r="0" fill="none" stroke="#e50914" stroke-width="9">
  <animate attributeName="r" repeatCount="indefinite" dur="1s" values="0;41" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="0s"/>
  <animate attributeName="opacity" repeatCount="indefinite" dur="1s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="0s"/>
</circle><circle cx="50" cy="50" r="0" fill="none" stroke="#221f1f" stroke-width="9">
  <animate attributeName="r" repeatCount="indefinite" dur="1s" values="0;41" keyTimes="0;1" keySplines="0 0.2 0.8 1" calcMode="spline" begin="-0.5s"/>
  <animate attributeName="opacity" repeatCount="indefinite" dur="1s" values="1;0" keyTimes="0;1" keySplines="0.2 0 0.8 1" calcMode="spline" begin="-0.5s"/>
</circle>
<!-- [ldio] generated by https://loading.io/ --></svg>
`
