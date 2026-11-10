"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerReply, WorkerRequest } from "../features/interview/voice-types";


async function decodeAudio(blob: Blob): Promise<Float32Array> {
  const context = new AudioContext();
  let decoded: AudioBuffer;
  try { decoded = await context.decodeAudioData(await blob.arrayBuffer()); }
  finally { await context.close(); }
  if (decoded.duration < 0.4 || decoded.duration > 181) {
    throw new Error("Record between half a second and 3 minutes of audio.");
  }
  // Downmix and resample to the mono 16 kHz input Whisper expects.
  const renderer = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  const source = renderer.createBufferSource();
  source.buffer = decoded;
  source.connect(renderer.destination);
  source.start();
  const rendered = await renderer.startRendering();
  const audio = new Float32Array(rendered.getChannelData(0));
  let energy = 0;
  for (const sample of audio) energy += sample * sample;
  if (Math.sqrt(energy / audio.length) < 0.001) {
    throw new Error("The recording is nearly silent. Speak closer to the microphone or type your answer.");
  }
  return audio;
}

export function useLocalTranscription() {
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  const pending = useRef<{ reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const terminate = useCallback(() => {
    sequence.current++;
    if (pending.current) {
      clearTimeout(pending.current.timer);
      pending.current.reject(new Error("Transcription cancelled. Your recording is still available."));
      pending.current = null;
    }
    worker.current?.terminate();
    worker.current = null;
  }, []);
  useEffect(() => terminate, [terminate]);
  const cancel = () => { terminate(); setBusy(false); setMessage(""); };

  async function transcribe(blob: Blob): Promise<string> {
    if (pending.current) throw new Error("Please wait for the current transcription.");
    const id = ++sequence.current;
    setBusy(true);
    setMessage("Preparing audio…");
    try {
      const audio = await decodeAudio(blob);
      if (id !== sequence.current) throw new Error("Transcription cancelled.");
      worker.current ??= new Worker(new URL("../features/interview/workers/whisper.worker.ts", import.meta.url), { type: "module" });
      const activeWorker = worker.current;
      return await new Promise<string>((resolve, reject) => {
        const finish = (error?: Error, text = "") => {
          if (id !== sequence.current) return;
          if (pending.current) clearTimeout(pending.current.timer);
          pending.current = null;
          if (error) reject(error); else resolve(text);
        };
        const timer = setTimeout(() => {
          terminate();
          setBusy(false);
          setMessage("Transcription timed out. Retry or type your answer.");
        }, 10 * 60 * 1000);
        pending.current = { reject, timer };
        activeWorker.onmessage = (event: MessageEvent<WorkerReply>) => {
          const result = event.data;
          if (result.id !== id || id !== sequence.current) return;
          if (result.type === "status") setMessage(result.message);
          else if (result.type === "result") finish(undefined, result.text);
          else finish(new Error(result.message));
        };
        activeWorker.onerror = () => {
          finish(new Error("Could not run the local speech model. Retry or type your answer."));
          activeWorker.terminate();
          if (worker.current === activeWorker) worker.current = null;
        };
        const request: WorkerRequest = { id, audio };
        activeWorker.postMessage(request, [audio.buffer]);
      });
    } finally {
      if (id === sequence.current) { setBusy(false); setMessage(""); }
    }
  }
  return { busy, message, transcribe, cancel };
}
