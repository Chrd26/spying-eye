let video;
let detector;
let detections = [];
let startDetectionBtn = document.getElementById("start-detection");
let curr_detections = 0;

// Send json to the server
// Source: https://stackoverflow.com/questions/26079754/flask-how-to-return-a-success-status-code-for-ajax-call
function sendJson(object, date, time){
  $.ajax({
    type: "POST",
    contentType: "application/json;",
    data: JSON.stringify({"object": object, "date": date, "time": time}),
    dataType: "json",
    url: "/stats",
  })
}

  // Get results for detections
  function gotDetections(error, results){
    if (error){
      console.log(error);
    }else{
      // console.log(results);
      detections = results;
      detector.detect(video, gotDetections);
    }
  }

  async function setup(){
    // Create Canvas in a certain position, and add it as a child to a div element
    // source: https://github.com/processing/p5.js/wiki/Positioning-your-canvas
    let cnv = createCanvas(640,480);
    cnv.parent("sketch-element");
    cnv.style("display", "block");
    cnv.style("margin", "auto");
    cnv.style("margin-top", "2vh");
    cnv.style("max-width", "100%");

    background(220)
    detector = ml5.objectDetector("models/yolov8n-best_web_model/model.json");
    // User the back camera if possible, otherwise use the front camera
    // https://www.digitalocean.com/community/tutorials/front-and-rear-camera-access-with-javascripts-getusermedia
    // Ideal makes the device look for the "environment" camera first, if there is not one, then use the user camera.
    video = await createCapture({video: {facingMode: {ideal: "environment"}}, audio: false});
    video.hide()
    //video.size(width, height);
    detector.detect(video, gotDetections);
  }

  function draw(){
    // Get the date and local time using JSJoda
    // Js Joda is a simple library that handles time and dates.
    let getDateTime = JSJoda.ZonedDateTime.now() 

    let getData;

    // Get the hours, minutes, and seconds by concatenation
    let getTime = getDateTime["_dateTime"]["_time"]["_hour"].toString() + ":"  
                  + getDateTime["_dateTime"]["_time"]["_minute"].toString() + ":" 
                  + getDateTime["_dateTime"]["_time"]["_second"].toString();

    let getDate = getDateTime["_dateTime"]["_date"]["_year"] + "."
                  + getDateTime["_dateTime"]["_date"]["_month"] + "."
                  + getDateTime["_dateTime"]["_date"]["_day"];

    // Get only the label value by using the map method
    // When we want to return an object with multiple values, we must 
    //Make sure that the object is in parentheses
    // return ({key1: "value1", key2: "value2"})
    getData = detections.map(detection => ({label:detection["label"],confidence:detection["confidence"]}));
    // console.log(getDateTime);
    // console.log("Time: " + getTime);
    // console.log("getDate: " + getDate);
    //console.log(getData);
    

    // Handle detections to send them to the server
    // When there is not anything to detect, then curr_detections is 0
    // If detections exit, assign the number of detections to curr_detections
    // Only if the value of detections. length is bigger or lower
    if (detections.length == 0){
      curr_detections = 0;
    }else{
      if (detections.length > curr_detections || detections.length < curr_detections){
        curr_detections = detections.length;
        sendJson(getData, getDate, getTime);
      }
    }

    // console.log("Count current detections: " + curr_detections);
    background(220);
    // Make sure the video takes up the whole canvas
    // source: https://stackoverflow.com/questions/62686362/stretch-a-video-in-p5-js
    image(video, 0, 0, width, height);

    for (let i = 0; i < detections.length; i++){
      let object = detections[i];
      // console.log(object);
      // Create Bounding Boxes
      stroke(0, 255, 0);
      strokeWeight(4);
      noFill();
      rect(object.x, object.y, object.width, object.height)

      // Create label for each object detected
      stroke(0);
      fill(255);
      text(object.label, object.x + 10, object.y + 24);
    }
  }
