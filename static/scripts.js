let video;
let detector;
let detections = [];
let startDetectionBtn = document.getElementById("start-detection");
let curr_detections = 0;

  // Get results for detections
  function gotDetections(error, results){
    if (error){
      console.log(error);
    }else{
      console.log(results);
      detections = results;
      // Are the results empty?
      if (Object.keys(detections) == 0){
        curr_detections = 0;
        // If they are empty, then if the keys are more than the current detections
        // Increase them
       // Send a json file with timestamp, and the detection. 
      } else if (Object.keys(detections) > curr_detections){
          curr_detections++;
        }
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
    background(220);
    image(video, 0, 0);

    for (let i = 0; i < detections.length; i++){
      let object = detections[i];
      
      console.log(object.label);
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
