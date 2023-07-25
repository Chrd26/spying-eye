from aiortc.contrib.media import MediaStreamTrack
from av import VideoFrame

class VideoManager(MediaStreamTrack):
    """Transform Frames."""

    kind = "video";

    def __init__(self, track, transform):
        super().__init__()
        self.track = track
        self.transform = transform


    async def recv(self):
        print(self.track)
        frame = await self.track.recv()
        print(frame)
        return frame;
