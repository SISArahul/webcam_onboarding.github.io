var startRecordingButton = false;
    var timerForRecording;
    
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    var Content = document.createElement("div") 
    Content.innerHTML= `
    <div id="videoContainer">
    <video id="video" autoplay></video>
    </div>
    <div id="TimerForCapture">
    <span></span>
    </div>
    <div class="buttonsForcapture">
    <button  type="button" id="stop-record" class="cancelButton" onclick="cancelRecording()" style="display: none;">Cancel</button>
    <button type="button" id="start-record" class="startUploadButton d-flex" onclick="startRecording()">Start</button>
    <button type="button" id="Register-record" class="RegisterUploadButton d-flex" onclick="RegisterRecording()">Upload and register</button>
    
    </div>
    <div class="infoForCapture">
    <span>10 sec face registration video will captured, place your face inside the box</span>
    </div>
    <div id="faceShape">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="224.000000pt" height="312.000000pt" viewBox="0 0 224.000000 312.000000" preserveAspectRatio="xMidYMid meet">
    
        <g transform="translate(0.000000,312.000000) scale(0.100000,-0.100000)" fill="#3e55dc" stroke="none">
        <path d="M976 3110 c-438 -50 -808 -334 -936 -716 -39 -119 -43 -170 -15 -190 19 -14 61 -12 77 5 4 4 16 41 27 82 83 323 353 581 706 676 91 24 117 27 280 27 198 0 256 -10 408 -74 147 -61 319 -197 426 -335 60 -78 133 -222 156 -309 21 -76 41 -95 88 -77 42 16 43 48 5 159 -127 370 -457 655 -853 737 -93 19 -269 26 -369 15z"/>
        <path d="M433 550 c-31 -13 -36 -42 -18 -111 49 -194 214 -340 449 -399 342 -86 681 -15 881 184 127 128 191 307 117 330 -38 12 -70 -10 -82 -56 -44 -166 -232 -320 -442 -362 -43 -9 -127 -16 -190 -16 -339 1 -580 142 -629 370 -13 63 -37 80 -86 60z"/>
        </g>
        </svg>
    </div>
    `
    document.body.appendChild(Content);
    let video = document.querySelector("#video");
    var videourl;
  
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models')
      ]).then(startWeb)

 

    function startWeb(){
        if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            var successCallback = function (stream) {
                video.srcObject = stream;
                window.stream = stream;
                video.play();
            };
            var errorCallback = function (error) {
              if (error.name == "NotAllowedError") {
                alert("Please allow access to the camera");
                navigator.mediaDevices
                  .getUserMedia({ video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }, audio: false })
                  .then(successCallback, errorCallback);
              }
            };
            navigator.mediaDevices
                  .getUserMedia({ video: {}, audio: false })
                  .then(successCallback, errorCallback);
        }
        
    }

    //Functions to record video
    

    
    function startRecording() {
        
        recordedBlobs = [];
        let options = {mimeType: 'video/webm;codecs=vp9,opus'};
        
        try {
          mediaRecorder = new MediaRecorder(window.stream, options);
        } catch (e) {
          //console.error('Exception while creating MediaRecorder:', e);
          errorMsgElement.innerHTML = `Exception while creating MediaRecorder: ${JSON.stringify(e)}`;
          return;
        }
      
        //console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
        mediaRecorder.onstop = (event) => {
          //console.log('Recorder stopped: ', event);
          //console.log('Recorded Blobs: ', recordedBlobs);
        };
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        //console.log('MediaRecorder started', mediaRecorder.state);
        startTimerForRecording();
      }
      
      function stopRecording() {
        mediaRecorder.stop();
        $("#start-record").html(`Start`)
        
      }
    
      function cancelRecording(){
          if(mediaRecorder.state=="inactive"){
              console.log("recording already stoped")
              recordedBlobs = [];
            $("#start-record").html(`Start`)
            $("#start-record").css("display","flex")
            $("#Register-record").css("display","none")
          }
          else{
            videourl='';
            mediaRecorder.stop();
            recordedBlobs = [];
            $("#start-record").html(`Start`)
            $("#TimerForCapture").css('display', 'none')
            clearInterval(timerForRecording)
          }
      }
    
      function RegisterRecording(){
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
        videourl = window.URL.createObjectURL(blob);
        // let recordingPreview = document.getElementById("recordingPreview");
        // recordingPreview.src = videourl;
        let file = new File([blob], 'filename', { type: 'video/mp4',    lastModified: Date.now() })
        var form = new FormData();
        form.append("VideoFile", file);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = videourl;
        a.download = 'test.mp4';
        document.body.appendChild(a);
        a.click();
        // var settings = {
        //   "url": location.origin+"/account/FaceRegistration",
        //   "method": "POST",
        //   "timeout": 0,
        //   "processData": false,
        //   "mimeType": "multipart/form-data",
        //   "contentType": false,
        //   "data": form
        // };
        // abp.ui.setBusy()
        // $.ajax(settings).done(function (response) {
        //     abp.ui.clearBusy()
        //   console.log(JSON.parse(response).success);
        //   if(JSON.parse(response).success){
        //     abp.notify.success(JSON.parse(response).result)
        //   }
        //   else{
        //     abp.notify.error(JSON.parse(response).result) 
        //   }
        // });
      }
      video.addEventListener('play', () => {
        setTimeout(function(){
          setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
           console.log(detections.length)
           if(detections.length==0){
             console.log("No face Detected, Please put your face in the box for registration")
           }
           else{
            if(detections.length>=2){
              console.log("Multilple face Detected, Please put your face only in the box for registration")
            }
           }
         
          }, 500)
        },1000)
      })
    
    // var downloadButton = document.querySelector('#download-video')
    //   downloadButton.addEventListener('click', () => {
        
    //     // const a = document.createElement('a');
    //     // a.style.display = 'none';
    //     // a.href = videourl;
    //     // a.download = 'test.mp4';
    //     // document.body.appendChild(a);
    //     // a.click();
    //     // setTimeout(() => {
    //     //   document.body.removeChild(a);
    //     //   window.URL.revokeObjectURL(videourl);
    //     // }, 100);
    //   });
    
      function handleDataAvailable(event) {
        //console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      }
      function startTimerForRecording(){
        
        var count = 0;
          timerForRecording = setInterval(function(){
            count++
            $("#TimerForCapture").html("<span>"+count+"</span>")
            $("#TimerForCapture").css('display', 'flex')
            $("#start-record").html(`${loadingIcon}  Recording`)
            $("#stop-record").css('display', 'block')
            //console.log(count)
            if(count>=10){
            clearInterval(timerForRecording)
            stopRecording()
            $("#TimerForCapture span").css('background', '#31CE2E')
            $("#start-record").css("display","none")
            $("#Register-record").css("display","flex")
          }
          }, 1000)
          
      }
      }else{
        // false for not mobile device
        alert("Please open the link in mobile device");
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





 
