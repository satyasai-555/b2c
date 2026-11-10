import { env, pipeline } from "@huggingface/transformers";
import type { WorkerRequest, WorkerReply } from "../voice-types";

// This worker receives PCM in memory. It never uploads audio or transcripts.
// Network requests fetch public model/runtime files only.
env.allowLocalModels = false;
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1;
const createTranscriber = () => pipeline(
  "automatic-speech-recognition", "Xenova/whisper-tiny.en",
  { device: "wasm", dtype: "fp32" },
);
let transcriber: ReturnType<typeof createTranscriber> | null = null;
let busy = false;
const reply = (message: WorkerReply) => self.postMessage(message);
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, audio } = event.data;
  if (busy) {
    reply({ id, type: "error", message: "Another answer is still being transcribed." });
    return;
  }
  busy = true;
  try {
    if (!(audio instanceof Float32Array) || !audio.length || audio.length > 16000 * 181) {
      throw new Error("Invalid audio length. Record an answer of up to 3 minutes.");
    }
    reply({ id, type: "status", message: transcriber
      ? "Transcribing on your device…"
      : "Loading the English speech model. The first download may take several minutes…" });
    if (!transcriber) transcriber = createTranscriber();
    const model = await transcriber;
    reply({ id, type: "status", message: "Transcribing on your device…" });
    const result = await model(audio, { chunk_length_s: 30, stride_length_s: 5 });
    const text = Array.isArray(result) ? result.map(x => x.text).join(" ") : result.text;
    reply({ id, type: "result", text: text.trim() });
  } catch (error) {
    transcriber = null; // A failed download can be retried.
    reply({ id, type: "error", message: error instanceof Error ? error.message : "Transcription failed." });
  } finally {
    busy = false;
  }
};
