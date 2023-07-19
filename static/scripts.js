let proceeedButton = document.getElementById("proceed")
let videoStream = document.getElementById("cameraVideo")

window.onload = function()
{
  console.log("Hello World!")
}

proceeedButton.onclick = function()
{
  console.log("Load video")

  // Camera Source https://www.kirupa.com/html5/accessing_your_webcam_in_html5.hthttps://www.kirupa.com/html5/accessing_your_webcam_in_html5.htmm
  // Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera
  // Now adapt container to camera size https://www.w3schools.com/js/js_htmldom_css.asp
  if (navigator.mediaDevices.getUserMedia)
  {
   navigator.mediaDevices.getUserMedia({video: true}).then(function(stream)
     {
       // Set source to stream
       videoStream.srcObject = stream;
       // Get stream settings
       let getSettings = stream.getTracks()[0].getSettings();
       console.log(getSettings["width"]);
       let getWidth = getSettings["width"]
       let getHeight = getSettings["height"]

        // Apply  webcam width and height to the page
       console.log("Width: " + getWidth + " Heignt: " + getHeight + ".")
       videoStream.style.display = "block";
       videoStream.style.width = getWidth + "px";
       videoStream.style.height = getHeight + "px";
      })
   .catch(function(err0r)
     {
       console.log("Something Went Wrong!")
     });
  }
}
