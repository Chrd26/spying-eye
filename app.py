"""Import All.""" 
import asyncio
import secrets
import uuid
import asyncio

import aiortc as aio
from flask import Flask,render_template 
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy
from helpers import VideoManager

app = Flask(__name__)
cors(app)
app.config["TEMPLATES_AUTO_RELOAD"] = True

pcs = set()
dcs = set()

event_loop = asyncio.new_event_loop()
asyncio.set_event_loop(event_loop)

# On start load index.htnl
@app.route("/", methods = ["POST", "GET"])
def index():
    """Load the Index webpage."""
    return render_template("index.html")

# Offer
@app.route("/offer", methods=["POST"])
def offer():
    params = request.json
    setOffer = aio.RTCSessionDescription(sdp=params["sdp"], type=params["type"])

    pc = aio.RTCPeerConnection()
    pc_id = "PeerConnections(%s)" % uuid.uuid4()
    pcs.add(pc)


# Use webrtc, source: https://www.youtube.com/watch?v=VbbDzx3jCoE
@app.route("/run_analysis")
# Handle Upcoming traffic source: https://github.com/aiortc/aiortc/blob/main/examples/server/server.py
async def offer(request):
    """Handle Incoming data."""
    params = await request.json()
    offer = RTCSessionDescription(sdp = params["sdp"], type=params["type"])

    pc = RTCPeerConnection()
    pcs.add(pc)

    @pc.on("datachannel")
    def on_datachannel(channel):
        @channel.on("message")
        def on_message(message):
            if isinstance(message, str) and message.startswith("ping"):
                channel.send("pong" + message[4:])

    @pc.on("iceconnectionstatechange")
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == "failed":
            await pc.close()
            pcs.discard(pc)

    @pc.on("icegatheringstatechange")
    async def on_icegatheringstatechange():
        if pc.iceGatheringState == "complete":
            ice_candidates = [{"spdMLineIndex": c.sdpMLineIndex, "candidate": c.candidate} for c in pc.localDescription.sdp.splitelines() if c.startswith("a=candidate:")]
            response = {"sdp": {"type": pc.localDescription.type, "sdp": pc.localDescription.sdp}, "ice_candidates": ice_candidates}
            return web.Response(content_type = "application.json", text = json.dumps(response))

    @pc.on("track")
    def on_track(track):
        pc.addTrack(RELAY.subscribe(track))

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.response(content_type="application/json", text=json.dumps({"sdp":{"type": pc.localDescription.type, "sdp": pc.localDescription.sdp}}))

