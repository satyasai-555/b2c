"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export type RecorderStatus = "idle" | "requesting" | "recording" | "paused" | "stopping";
export function useVoiceRecorder(deviceId: string) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopTracks = () => {
    stream.current?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    stream.current = null;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
  };
  const dispose = useCallback(() => {
    generation.current++;
    const current = recorder.current;
    if (current) {
      current.ondataavailable = null;
      current.onstop = null;
      current.onerror = null;
      if (current.state !== "inactive") current.stop();
    }
    recorder.current = null;
    stopTracks();
  }, []);
  useEffect(() => dispose, [dispose]);
  function stop() {
    if (recorder.current && recorder.current.state !== "inactive") {
      setStatus("stopping");
      recorder.current.stop();
      stopTracks();
    }
  }
  function reset() { dispose(); setStatus("idle"); setBlob(null); setError(""); }
  async function start() {
    dispose();
    const currentGeneration = generation.current;
    setStatus("requesting"); setError(""); setBlob(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Recording needs a supported browser on localhost or HTTPS. You can type instead.");
      }
      const media = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      });
      if (currentGeneration !== generation.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media;
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg;codecs=opus"]
        .find(type => MediaRecorder.isTypeSupported(type));
      const instance = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
      recorder.current = instance;
      const chunks: Blob[] = [];
      instance.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      instance.onstop = () => {
        if (currentGeneration !== generation.current) return;
        stopTracks();
        const result = new Blob(chunks, { type: instance.mimeType || chunks[0]?.type || "audio/webm" });
        setBlob(result.size ? result : null);
        if (!result.size) setError("No audio was captured. Record again or type your answer.");
        setStatus("idle");
        recorder.current = null;
      };
      instance.onerror = () => {
        if (currentGeneration !== generation.current) return;
        setError("Recording was interrupted. Review any captured audio or type your answer.");
        stop();
        if (instance.state === "inactive") { stopTracks(); setStatus("idle"); }
      };
      media.getAudioTracks().forEach(track => {
        track.onended = () => {
          if (currentGeneration !== generation.current) return;
          setError("Microphone disconnected. Review the captured audio or type your answer.");
          stop();
        };
      });
      instance.start(1000);
      setStatus("recording");
      timeout.current = setTimeout(() => {
        if (currentGeneration !== generation.current) return;
        setError("The 3-minute recording window has ended. Review and transcribe your answer.");
        stop();
      }, 180000);
    } catch (cause) {
      if (currentGeneration !== generation.current) return;
      dispose(); setStatus("idle");
      setError(cause instanceof Error && cause.name === "NotAllowedError"
        ? "Microphone permission was denied. Allow access or type your answer."
        : cause instanceof Error ? cause.message : "Recording could not start.");
    }
  }
  function togglePause() {
    const current = recorder.current;
    if (current?.state === "recording") { current.pause(); setStatus("paused"); }
    else if (current?.state === "paused") { current.resume(); setStatus("recording"); }
  }
  return { status, blob, error, start, stop, reset, togglePause };
}
