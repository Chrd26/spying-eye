"""Import flask."""
from flask import Flask,render_template,request,send_from_directory
from flask_socketio import SocketIO, emit
from ultralytics import YOLO
import cv2
import numpy

app = Flask(__name__)
app.secret_key = "videosstreamapp"
socketio = SocketIO(app,cors_allowed_origins="*")

@app.route("/", methods = ["POST", "GET"])
def index():
    """Load the Index webpage."""
    return render_template("index.html") 

# Create a new route that should run the analysis of the video stream
# Use webrtc, source: https://www.youtube.com/watch?v=VbbDzx3jCoE
@app.route("/run_analysis")
def run_analysis():
    """Analyze the video stream."""
    print("It Works!")
    return "nothing to return"
