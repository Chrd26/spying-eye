const proceeedButton = document.getElementById("proceed");
const videoStream = document.getElementById("cameraVideo");

// Set Up peer connection
// Source for webrtc connection to python wtih aiortc: https://github.com/aiortc/aiortc/blob/main/examples/server/client.js
// Try to get stream and display it on the page.
// Source: https://webrtc.org/getting-started/media-devices#using-promises
// Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera

// Peer Connection
let pc = null;

// Data channel, data channel internal
let dataChannel = null, dcInternal = null;

// Let's create peer connection
function createPeerConnection(){

  let config = {sdpSemantics: "unified-plan"};
  config.iceServers = [{urls: ['stun:stun.l.google.com:19302']}];

  pc = new RTCPeerConnection(config);

    // Log the changes on ice gathering state change, ice connection state change and signal state change
  pc.addEventListener('icegatheringstatechange', function(){
    console.log(' -> ' + pc.iceGatheringState);
  }, false);

  pc.addEventListener('iceconnectionstatechange', function() {
      console.log(' -> ' + pc.iceConnectionState);
  }, false);

  pc.addEventListener('signalingstatechange', function() {
      console.log(' -> ' + pc.signalingState);
  }, false);

  // Play video
  pc.addEventListener("track", function(evt){
    videoStream.srcObject = evt.streams[0];
  });

  return pc;
}

// Negotiate between server and client
function negotiate(){
  return pc.createOffer().then(function(offer){
    return pc.setLocalDescription(offer);
  }).then(function(){
    // Wait for ICE to gather data
    return new Promise (function(resolve){
      if (pc.iceGatheringState === "complete"){
        resolve();
      }else{
        function checkState(){
          if (pc.iceGatheringState === "complete"){
            pc.removeEventListener("icegatheringstatechange", checkState);
            resolve();
          }
        }
        pc.addEventListener("icegatheringstatechange", checkState);
      }
    });
  }).then(function(){
    var offer = pc.localDescription;

    return fetch("/offer", {
      body: JSON.stringifiy({
        sdp: offer.sdp,
        type: offer.type,
      }),
      headers:{
        "content-type": "application/json"
      },
      method:"POST"
    });
  }).then(function(response){
    return response.json();
  }).then(function(answer){
    return pc.setRemoteDescription(answer);
  }).catch(function(e){
    alert(e);
  });
}

async function streamMain()
{
  
  pc = createPeerConnection();

  let time_start = null;

  // get current time stamp
  function current_stamp(){
    if (time_start === null){
      time_start = new Date().getTime();
      return 0;
    }else{
      return new Date().getTime() - time_start; 
    }
  }

  try{
    // Set Camera settings to start streaming
    const constraints = {"video": true, "audio": false};
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoElement = document.querySelector("video#cameraVideo");
    const trackSettings = stream.getTracks()[0].getSettings();
    videoStream.style.display = "block";
    videoStream.style.width = trackSettings["width"] + "px";
    videoStream.style.height = trackSettings["height"] + "px";

    stream.getTracks().forEach(function(track){
      pc.addTrack(track, stream);
    });

    return negotiate();
  }
  catch(error){
    console.error("Error opening camera", error);
  }
}

window.onload = function()
{
  console.log("Hello World!");
}
// Run when the proceedButton is clicked
proceeedButton.onclick = function()
{
  // Add animations and declare variables
  // To prevent the animation from reseting, use the forwards play mode. source: https://stackoverflow.com/questions/17296919/how-to-prevent-css3-animation-reset-when-finished
  document.getElementById("desc-1").style.animation = "movedesc1 0.5s ease forwards"
  document.getElementById("desc-2").style.animation = "movedesc2 0.5s ease forwards"
  document.getElementById("proceed").style.animation = "moveButton 0.5s ease forwards"
  let newButton;
  const animated = document.getElementById("proceed")
  let isButtonPressed = true;

  // Camera Source https://www.kirupa.com/html5/accessing_your_webcam_in_html5.hthttps://www.kirupa.com/html5/accessing_your_webcam_in_html5.htmm
  // Now adapt video container to camera size https://www.w3schools.com/js/js_htmldom_css.asp
  // Run when animation ends Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
  animated.addEventListener("animationend", function(){
    if (!isButtonPressed)
    {
      return;
    }

    // Hide uneeded elements
    document.getElementById("desc-1").style.display="none";
    document.getElementById("desc-2").style.display="none";
    document.getElementById("proceed").style.display="none";
    
    // Get the back element and display it
    const backButton = document.getElementById("back");
    backButton.style.display="block";

    isButtonPressed = false;

    streamMain();
  })
}
