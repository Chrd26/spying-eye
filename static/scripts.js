let video;
let detector;
let detections = [];
let startDetectionBtn = document.getElementById("start-detection");


  console.log("start detection");

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
    detector = ml5.objectDetector("cocossd");
    video = createCapture(video);
    video.size(640, 480);
    detector.detect(video, gotDetections);
  }

  function draw(){
    background(220);
    image(video, 0, 0);

    for (let i = 0; i < detections.length; i++){
      let object = detections[i];

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
