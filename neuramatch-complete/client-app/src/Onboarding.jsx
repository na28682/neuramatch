import { useState, useEffect, useRef } from "react";

const STEPS = [
  { text: "hello.", subtext: null },
  { text: "who are you, really?", subtext: null },
  { text: "are you ready?", subtext: "take a breath. there's no wrong answer." },
];

const STEP_DELAY = 2600;

export default function Onboarding({ onMatch }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (stepIndex < STEPS.length) {
      const timer = setTimeout(() => {
        setStepIndex((i) => i + 1);
      }, STEP_DELAY);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShowInput(true), 900);
      return () => clearTimeout(timer);
    }
  }, [stepIndex]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      setError("camera access was denied or is unavailable");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Captures a single frame from the video feed as a base64 image.
  // This frame can be sent to a vision model to read expression/mood.
  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL("image/jpeg");
  };

  const handleSubmit = async () => {
    if (!mood.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8080/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!response.ok) {
        throw new Error("matching request failed");
      }

      const data = await response.json();
      onMatch(data);
    } catch (err) {
      setError("something went wrong reaching the matching service");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="onboarding">
      {!showInput && (
        <div className="onboarding-step">
          {stepIndex < STEPS.length && (
            <>
              <p className="onboarding-text">{STEPS[stepIndex].text}</p>
              {STEPS[stepIndex].subtext && (
                <p className="onboarding-subtext">{STEPS[stepIndex].subtext}</p>
              )}
            </>
          )}
        </div>
      )}

      {showInput && (
        <div className="onboarding-input-wrap">
          <p className="onboarding-prompt">tell me how you're feeling right now</p>

          <div className="onboarding-bubble">
            <input
              type="text"
              placeholder="i feel..."
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="button"
              aria-label="use camera to read expression"
              onClick={toggleCamera}
              className="icon-button"
            >
              📷
            </button>
            <button
              type="button"
              aria-label="send"
              onClick={handleSubmit}
              className="icon-button"
              disabled={loading}
            >
              →
            </button>
          </div>

          {cameraActive && (
            <div className="onboarding-camera">
              <video ref={videoRef} autoPlay playsInline muted />
              <p className="onboarding-hint">reading your expression to understand how you feel</p>
            </div>
          )}

          {loading && <p className="onboarding-hint">finding your matches...</p>}
          {error && <p className="onboarding-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
