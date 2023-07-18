"""Import flask."""
from flask import Flask, render_template
from ultralytics import YOLO
import numpy

app = Flask(__name__)

@app.route("/")
def index():
    """Load the Index webpage."""
    return render_template("index.html") 

