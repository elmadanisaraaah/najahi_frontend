// Returns a human-readable French error for getUserMedia failures
export function getCameraErrorMessage(err) {
  if (!navigator.mediaDevices) {
    return window.isSecureContext === false
      ? "L'accès à la caméra nécessite une connexion HTTPS."
      : "Votre navigateur ne supporte pas l'accès à la caméra. Essayez Chrome ou Firefox.";
  }
  const name = err?.name || "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError")
    return "Permission refusée. Cliquez sur l'icône caméra dans la barre d'adresse pour autoriser, puis réessayez.";
  if (name === "NotFoundError" || name === "DevicesNotFoundError")
    return "Aucune caméra détectée sur cet appareil.";
  if (name === "NotReadableError" || name === "TrackStartError")
    return "La caméra est déjà utilisée par une autre application. Fermez-la puis réessayez.";
  if (name === "OverconstrainedError")
    return "Les paramètres vidéo demandés ne sont pas supportés par votre caméra.";
  if (name === "TypeError")
    return "Votre navigateur ne supporte pas l'accès à la caméra. Essayez Chrome ou Firefox en HTTPS.";
  return "Impossible d'accéder à la caméra. Vérifiez les permissions de votre navigateur.";
}

// Safe wrapper around getUserMedia — throws with a readable message on failure
export async function requestCamera(constraints = { video: true }) {
  if (!navigator.mediaDevices?.getUserMedia) {
    const msg = window.isSecureContext === false
      ? "L'accès à la caméra nécessite une connexion HTTPS."
      : "Votre navigateur ne supporte pas l'accès à la caméra. Essayez Chrome ou Firefox.";
    throw Object.assign(new Error(msg), { userMessage: msg });
  }
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    const msg = getCameraErrorMessage(err);
    throw Object.assign(err, { userMessage: msg });
  }
}

export async function getUserMediaStream({ audio = true, video = true } = {}) {
  return requestCamera({ audio, video });
}

export async function getScreenShareStream() {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Le partage d'écran n'est pas supporté par votre navigateur.");
  }
  return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
}

export function createPeerConnection(onIceCandidate, onTrack) {
  const pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
  });
  pc.onicecandidate = (event) => { if (event.candidate) onIceCandidate(event.candidate); };
  pc.ontrack = (event) => { const [stream] = event.streams; onTrack(stream); };
  return pc;
}
