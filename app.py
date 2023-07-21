"""Import flask."""
from flask import Flask,render_template,request
from ultralytics import YOLO
import cv2
import numpy

app = Flask(__name__)

@app.route("/", methods = ["POST", "GET"])
def index():
    """Load the Index webpage."""
    return render_template("index.html") 

# Create a new route that should run the analysis of the video stream
@app.route("/run_analysis")
def run_analysis():
    """Analyze the video stream."""
    print("It Works!")
    return "nothing to return"
