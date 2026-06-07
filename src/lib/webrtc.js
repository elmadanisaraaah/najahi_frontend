export async function getUserMediaStream({ audio = true, video = true } = {}) {
  return await navigator.mediaDevices.getUserMedia({
    audio,
    video,
  })
}

export async function getScreenShareStream() {
  return await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true,
  })
}

export function createPeerConnection(onIceCandidate, onTrack) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  })

  pc.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate)
  }

  pc.ontrack = (event) => {
    const [stream] = event.streams
    onTrack(stream)
  }

  return pc
}