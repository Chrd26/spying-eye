const proceeedButton = document.getElementById("proceed");
const videoStream = document.getElementById("cameraVideo");

window.onload = function()
{
  console.log("Hello World!");
}

// Run when the proceedButton is clicked
proceeedButton.onclick = function()
{
  console.log("Load video");
  let newButton;

  // Camera Source https://www.kirupa.com/html5/accessing_your_webcam_in_html5.hthttps://www.kirupa.com/html5/accessing_your_webcam_in_html5.htmm
  // Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera
  // Now adapt video container to camera size https://www.w3schools.com/js/js_htmldom_css.asp
  if (navigator.mediaDevices.getUserMedia)
  {
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
       console.log("Width: " + getWidth + " Heignt: " + getHeight + ".")
       videoStream.style.display = "block";
       videoStream.style.width = getWidth + "px";
       videoStream.style.height = getHeight + "px";

       // Hide uneeded elements
       document.getElementById("desc-1").style.display="none";
       document.getElementById("desc-2").style.display="none";
       document.getElementById("proceed").style.display="none";

       // Create new button if it dpesn't exists
       if(!document.getElementById("back"))
       {
         newButton  = document.createElement("button");
         const contentElement = document.createTextNode("Back");

        // Attribute settings
         // Source: https://bobbyhadz.com/blog/javascript-create-element-with-attributes
        newButton.classList.add("btn", "btn-outline-light");
        newButton.setAttribute("id", "back");
         newButton.setAttribute("type", "button");
        newButton.setAttribute("data-bs-toggle", "tooltip");
        newButton.setAttribute("data-bs-placement", "top");
        newButton.setAttribute("data-bs-custom-class", "custom-tooltip");
        newButton.setAttribute("data-bs-title", "Turn off the camera and return to the homepage.");

        // Stylize button
         // Source https://www.w3schools.com/js/js_htmldom_css.asp
        newButton.style.display="block";
        newButton.style.textAlign="center";
        newButton.style.width="10em";
        newButton.style.marginLeft="auto";
        newButton.style.marginRight="auto";
        newButton.style.marginTop="7em";

        // Add the element to the body and add text to it
        document.body.appendChild(newButton);
        document.getElementById("back").innerHTML = "Back";

       }
       else
       {
         // If the back button exists, then make it visible
         document.getElementById("back").style.display="block";
       }
       // Get the back element
       const backButton = document.getElementById("back");
       backButton.onclick = function()
       {
         backButton.display = "none";

         // Show default elements
         document.getElementById("desc-1").style.display="block";
         document.getElementById("desc-2").style.display="block";
         document.getElementById("proceed").style.display="block";
         videoStream.style.display="none";
         backButton.style.display="none";

         // Turn off camera
         // Source https://stackoverflow.com/questions/11642926/stop-close-webcam-stream-which-is-opened-by-navigator-mediadevices-getusermedia
         stream.getTracks().forEach(function(track) 
         {
           track.stop();
         });
       }

      })
   .catch(function(err0r)
     {
       console.log("Something Went Wrong!")
     });
  }
}
