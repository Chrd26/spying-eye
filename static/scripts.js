const proceeedButton = document.getElementById("proceed");
const videoStream = document.getElementById("cameraVideo");

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
  // Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera
  // Now adapt video container to camera size https://www.w3schools.com/js/js_htmldom_css.asp
  // Run when animation ends Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
  animated.addEventListener("animationend", function(){
    if (!isButtonPressed)
    {
      return;
    }

    if (navigator.mediaDevices.getUserMedia)
    {
      isButtonPressed = false;
      navigator.mediaDevices.getUserMedia({video: true}).then(function(stream)
        {
          // Set source to stream
          videoStream.srcObject = stream;
          // Get stream settings
          let getSettings = stream.getTracks()[0].getSettings();
          console.log(getSettings["width"]);
          let getWidth = getSettings["width"];
          let getHeight = getSettings["height"];

           // Apply  webcam width and height to the page
          // console.log("Width: " + getWidth + " Heignt: " + getHeight + ".")
          videoStream.style.display = "block";
          videoStream.style.width = getWidth + "px";
          videoStream.style.height = getHeight + "px";

          // Hide uneeded elements
          document.getElementById("desc-1").style.display="none";
          document.getElementById("desc-2").style.display="none";
          document.getElementById("proceed").style.display="none";

          // Get the back element and display it
          const backButton = document.getElementById("back");
          backButton.style.display="block";
        })
      .catch(function(err0r)
        {
          console.log("Something Went Wrong!")
        });
    }
  })
}
