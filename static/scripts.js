const proceeedButton = document.getElementById("proceed");
const videoStream = document.getElementById("cameraVideo");

// Set Up peer connection
// Source for webrtc connection to python wtih aiortc: https://github.com/aiortc/aiortc/blob/main/examples/server/client.js
// Try to get stream and display it on the page.
// Source: https://webrtc.org/getting-started/media-devices#using-promises
// Get camera Source width and height https://stackoverflow.com/questions/47593336/how-can-i-detect-width-and-height-of-the-webcamera

// Data channel, data channel internal
let dataChannel = null
// peer connection
var pc = null;

// data channel
var dc = null, dcInterval = null;

function createPeerConnection() {
    var config = {
        sdpSemantics: 'unified-plan'
    };

    config.iceServers = [{urls: ['stun:stun.l.google.com:19302']}];

    pc = new RTCPeerConnection(config);

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function() {
        console.log(' -> ' + pc.iceGatheringState);
    }, false);

    pc.addEventListener('iceconnectionstatechange', function() {
        console.log(' -> ' + pc.iceConnectionState);
    }, false);

    pc.addEventListener('signalingstatechange', function() {
        console.log(' -> ' + pc.signalingState);
    }, false);

    // connect audio / video
    pc.addEventListener('track', function(evt) {
        if (evt.track.kind == 'video')
            document.getElementById('video').srcObject = evt.streams[0];
        else
            document.getElementById('audio').srcObject = evt.streams[0];
    });

    return pc;
}

function negotiate() {
    return pc.createOffer().then(function(offer) {
        return pc.setLocalDescription(offer);
    }).then(function() {
        // wait for ICE gathering to complete
        return new Promise(function(resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function() {
        var offer = pc.localDescription;
        var codec;

        codec = document.getElementById('audio-codec').value;
        if (codec !== 'default') {
            offer.sdp = sdpFilterCodec('audio', codec, offer.sdp);
        }

        codec = document.getElementById('video-codec').value;
        if (codec !== 'default') {
            offer.sdp = sdpFilterCodec('video', codec, offer.sdp);
        }

        document.getElementById('offer-sdp').textContent = offer.sdp;
        return fetch('/offer', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
                video_transform: document.getElementById('video-transform').value
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function(response) {
        return response.json();
    }).then(function(answer) {
        document.getElementById('answer-sdp').textContent = answer.sdp;
        return pc.setRemoteDescription(answer);
    }).catch(function(e) {
        alert(e);
    });
}

function start() {

    pc = createPeerConnection();

    var time_start = null;

    function current_stamp() {
        if (time_start === null) {
            time_start = new Date().getTime();
            return 0;
        } else {
            return new Date().getTime() - time_start;
        }
    }

      var parameters = {ordered: true};

      dc = pc.createDataChannel('chat', parameters);
      dc.onclose = function() {
          clearInterval(dcInterval);
      };
      dc.onopen = function() {
          dcInterval = setInterval(function() {
              var message = 'ping ' + current_stamp();
              dc.send(message);
          }, 1000);
      };
      dc.onmessage = function(evt) {

          if (evt.data.substring(0, 4) === 'pong') {
              var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
          }
      };

    var constraints = {
        audio: false,
        video: true
    };
        navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
          stream.getTracks().forEach(function(track) {
            const videoElement = document.querySelector("video#cameraVideo");
            const trackSettings = stream.getTracks()[0].getSettings();
            videoStream.style.display = "block";
            videoStream.style.width = trackSettings["width"] + "px";
            videoStream.style.height = trackSettings["height"] + "px";
            pc.addTrack(track, stream);

            return negotiate();
          });
        }, function(err) {
            alert('Could not acquire media: ' + err);
        });
    }

function stop() {
    // close data channel
    if (dc) {
        dc.close();
    }

    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function(transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    pc.getSenders().forEach(function(sender) {
        sender.track.stop();
    });

    // close peer connection
    setTimeout(function() {
        pc.close();
    }, 500);
}

function sdpFilterCodec(kind, codec, realSdp) {
    var allowed = []
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')
    
    var lines = realSdp.split('\n');

    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }

        if (isKind) {
            var match = lines[i].match(codecRegex);
            if (match) {
                allowed.push(parseInt(match[1]));
            }

            match = lines[i].match(rtxRegex);
            if (match && allowed.includes(parseInt(match[2]))) {
                allowed.push(parseInt(match[1]));
            }
        }
    }

    var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    var sdp = '';

    isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }

        if (isKind) {
            var skipMatch = lines[i].match(skipRegex);
            if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
                continue;
            } else if (lines[i].match(videoRegex)) {
                sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n';
            } else {
                sdp += lines[i] + '\n';
            }
        } else {
            sdp += lines[i] + '\n';
        }
    }

    return sdp;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

window.onload = function()
{
  console.log("Hello World!");
}
// Run when the proceedButton is clicked
proceeedButton.onclick = function()
{
  // Add animations and declare variables
  // To prevent the animation from reseting, use the forwards play mode. source: https://stackoverflow.com/questions/17296919/how-to-prevent-css3-animation-reset-when-finished
  document.getElementById("desc-1").style.animation = "movedesc1 0.5s ease forwards"
  document.getElementById("desc-2").style.animation = "movedesc2 0.5s ease forwards"
  document.getElementById("proceed").style.animation = "moveButton 0.5s ease forwards"
  let newButton;
  const animated = document.getElementById("proceed")
  let isButtonPressed = true;

  // Camera Source https://www.kirupa.com/html5/accessing_your_webcam_in_html5.hthttps://www.kirupa.com/html5/accessing_your_webcam_in_html5.htmm
  // Now adapt video container to camera size https://www.w3schools.com/js/js_htmldom_css.asp
  // Run when animation ends Source: https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event
  animated.addEventListener("animationend", function(){
    if (!isButtonPressed)
    {
      return;
    }

    // Hide uneeded elements
    document.getElementById("desc-1").style.display="none";
    document.getElementById("desc-2").style.display="none";
    document.getElementById("proceed").style.display="none";
    
    // Get the back element and display it
    const backButton = document.getElementById("back");
    backButton.style.display="block";

    isButtonPressed = false;

    //streamMain();
    start();
  })
}
