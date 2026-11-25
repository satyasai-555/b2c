import { useCallback, useState } from "react";
import { candidateApi } from "../services/candidateApi";

export function useCandidateApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async <T,>(operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try { return await operation(); } catch (cause) { const message = cause instanceof Error ? cause.message : "Request failed"; setError(message); throw cause; } finally { setLoading(false); }
  }, []);
  return { loading, error, requestOtp: (email: string, guestSessionId: string) => run(() => candidateApi.requestOtp(email, guestSessionId)), verifyOtp: (payload: Parameters<typeof candidateApi.verifyOtp>[0]) => run(() => candidateApi.verifyOtp(payload)), createGuest: (guestSessionId: string) => run(() => candidateApi.createGuest(guestSessionId)), getCandidate: (candidateId: string) => run(() => candidateApi.getCandidate(candidateId)), saveAnswers: (candidateId: string, payload: Parameters<typeof candidateApi.saveAnswers>[1]) => run(() => candidateApi.saveAnswers(candidateId, payload)), uploadCv: (candidateId: string, payload: Parameters<typeof candidateApi.uploadCv>[1]) => run(() => candidateApi.uploadCv(candidateId, payload)) };
}
