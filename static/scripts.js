const proceeedButton = document.getElementById("proceed");
const videoStream = document.getElementById("cameraVideo");


// Try to get stream and display it on the page.
// Source: https://webrtc.org/getting-started/media-devices#using-promises
// Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera
async function playStream()
{
  try{
    const constraints = {"video": true, "audio": false};
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoElement = document.querySelector("video#cameraVideo");
    const trackSettings = stream.getTracks()[0].getSettings();
    videoStream.style.display = "block";
    videoStream.style.width = trackSettings["width"] + "px";
    videoStream.style.height = trackSettings["height"] + "px";
    videoElement.srcObject = stream;

    const connection = 
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

    playStream();
    
  })
}
