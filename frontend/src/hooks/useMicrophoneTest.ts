"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TestStatus = "idle" | "requesting" | "testing";

export function useMicrophoneTest() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");
  const [signalDetected, setSignalDetected] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);
  const requestRef = useRef(0);

  // Also invalidates pending permission requests.
  const release = useCallback(() => {
    requestRef.current += 1;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    const context = contextRef.current;
    contextRef.current = null;

    if (context && context.state !== "closed") {
      void context.close().catch(() => {});
    }
  }, []);

  const stop = useCallback(() => {
    release();
    setStatus("idle");
    setLevel(0);
  }, [release]);

  useEffect(() => release, [release]);

  function selectDevice(nextDeviceId: string) {
    stop();
    setDeviceId(nextDeviceId);
    setSignalDetected(false);
    setError("");
  }

  async function start() {
    release();

    const request = requestRef.current;

    setStatus("requesting");
    setSignalDetected(false);
    setError("");
    setLevel(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Microphone access requires localhost or HTTPS in a supported browser.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId
          ? { deviceId: { exact: deviceId } }
          : true,
        video: false,
      });

      // User may have stopped testing or left the page while permission
      // was being requested.
      if (request !== requestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const context = new AudioContext();
      contextRef.current = context;

      await context.resume();

      if (request !== requestRef.current) return;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);

      // Not connected to speakers: prevents microphone feedback.
      const samples = new Uint8Array(analyser.fftSize);
      let lastUpdate = 0;

      function updateMeter(time: number) {
        if (request !== requestRef.current) return;

        if (time - lastUpdate >= 80) {
          analyser.getByteTimeDomainData(samples);

          let sum = 0;

          for (const sample of samples) {
            const amplitude = (sample - 128) / 128;
            sum += amplitude * amplitude;
          }

          const rms = Math.sqrt(sum / samples.length);
          const nextLevel = Math.min(100, Math.round(rms * 500));

          setLevel(nextLevel);

          if (rms > 0.01) {
            setSignalDetected(true);
          }

          lastUpdate = time;
        }

        frameRef.current = requestAnimationFrame(updateMeter);
      }

      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          if (request !== requestRef.current) return;

          stop();
          setSignalDetected(false);
          setError("Microphone disconnected. Reconnect it and test again.");
        };
      });

      setStatus("testing");
      frameRef.current = requestAnimationFrame(updateMeter);

      // Device labels are available after permission is granted.
      void navigator.mediaDevices
        .enumerateDevices()
        .then((availableDevices) => {
          if (request !== requestRef.current) return;

          setDevices(
            availableDevices.filter(
              (device) => device.kind === "audioinput",
            ),
          );
        })
        .catch(() => {
          // The default microphone still works if listing devices fails.
        });
    } catch (cause) {
      if (request !== requestRef.current) return;

      release();
      setStatus("idle");
      setLevel(0);

      const name = cause instanceof Error ? cause.name : "";

      if (name === "NotAllowedError") {
        setError(
          "Microphone permission was denied. Allow access in your browser, or choose text answers.",
        );
      } else if (name === "NotFoundError") {
        setError("No microphone was found. Connect one or choose text answers.");
      } else if (name === "NotReadableError") {
        setError(
          "The microphone could not be opened. Check whether another app is using it.",
        );
      } else if (name === "OverconstrainedError") {
        setError("That microphone is unavailable. Select another device.");
      } else {
        setError(
          cause instanceof Error
            ? cause.message
            : "Unable to test the microphone.",
        );
      }
    }
  }

  return {
    status,
    devices,
    deviceId,
    level,
    error,
    signalDetected,
    start,
    stop,
    selectDevice,
  };
}