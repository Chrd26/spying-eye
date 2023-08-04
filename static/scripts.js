let video;
let detector;
let detections = [];
let startDetectionBtn = document.getElementById("start-detection");
let curr_detections = 0;

async function sendJson(object, timestamp){
  $.ajax({
    type: "POST",
    contentType: "application/json;",
    data: JSON.stringify({"object": object, "timestamp": timestamp}),
    dataType: "json",
    url: "/start",
  })
}

  // Get results for detections
  function gotDetections(error, results){
    if (error){
      console.log(error);
    }else{
      console.log(results);
      detections = results;
      detector.detect(video, gotDetections);
    }
  }

  function setup(){
    // Create Canvas in certain position, and add it as a child to a div element
    // source: https://github.com/processing/p5.js/wiki/Positioning-your-canvas
    let cnv = createCanvas(640,480);
    cnv.parent("sketch-element");
    cnv.style("display", "block");
    cnv.style("margin", "auto");
    cnv.style("margin-top", "2vh");

    background(220)
    detector = ml5.objectDetector("cocossd");
    video = createCapture(VIDEO);
    video.hide()
    video.size(640, 480);
    detector.detect(video, gotDetections);
  }

  function draw(){
    // Get date and local time
    // Source: https://javascript.info/date
    let now = new Date()
    console.log(now)
    console.log(detections.length)
    console.log(curr_detections)
    console.log(detections.length > curr_detections)

    // Handle detections to send them to the server
    // When there is not anything to detect, then curr_detections is 0
    // If detections exit, assign the amount of detections to curr_detections
    // Only if the value of detections.length is bigger or lower
    if (detections.length == 0){
      curr_detections = 0;
    }else{
      if (detections.length > curr_detections || detections.length < curr_detections){
        curr_detections = detections.length;
        sendJson(detections, now);
      }
    }

    console.log("Count current detections: " + curr_detections);
    background(220);
    image(video, 0, 0);

    for (let i = 0; i < detections.length; i++){
      let object = detections[i];
      // console.log(object);
      // Create Bounding Boxes
      stroke(0, 255, 0);
      strokeWeight(4);
      noFill();
      rect(object.x, object.y, object.width, object.height)

      // Create label for each object detected
      noStroke();
      fill(255);
      text(object.label, object.x + 10, object.y + 24);
    }
  }
