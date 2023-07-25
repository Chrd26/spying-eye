"""Import All."""
import asyncio
import json

from aiohttp import web
from aiortc import MediaStreamTrack, RTCPeerConnection, RTCSessionDescription
from flask import Flask,render_template
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder, MediaRelay
from av import VideoFrame
from ultralytics import YOLO
import cv2
import numpy

logger = logging.getLogger("pc")
pcs = set()
relay = MediaRelay()

class ObjectIdentifier(MediaStreamTrack):
    """Grab incoming videostream, analyze it for ML and output the video with bounding boxes."""

    kind = "video"
    # Initialize
    def init(self, track, transform):
        """Initiaze."""
        super()._init_()
        self.track = track
        self.transform = transform

    # Receive data
    async def recv(self):
        """Receive Video Data."""
        frame = await self.track.recv()
        return frame

app = Flask(__name__)

@app.route("/", methods = ["POST", "GET"])
def index():
    """Load the Index webpage."""
    return render_template("index.html") 

# Create a new route that should run the analysis of the video stream
# Use webrtc, source: https://www.youtube.com/watch?v=VbbDzx3jCoE
@app.route("/run_analysis")
async def run_analysis():
    """Analyze the video stream."""
    peer_connection = RTCPeerConnection()
    pc_id = "PeerConnection(%s)" % uuid.uuid4()
    pcs.add(peer_connection)

    print(peer_connection)
    return "nothing to return"
