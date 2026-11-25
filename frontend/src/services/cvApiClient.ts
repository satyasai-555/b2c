const CV_API_BASE_URL = (
    (import.meta.env.VITE_CV_API_BASE_URL as string | undefined) ?? ""
).replace(/\/+$/, "");

type CsrfResponse = {
    headerName: string;
    token: string;
};

type CvErrorResponse = {
    code?: string;
    message?: string;
};

export class CvApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string,
    ) {
        super(message);
        this.name = "CvApiError";
    }
}

async function readResponse<T>(response: Response): Promise<T> {
    const text = await response.text();

    let body: unknown;

    try {
        body = text ? JSON.parse(text) : undefined;
    } catch {
        throw new CvApiError(
            response.status,
            "INVALID_SERVER_RESPONSE",
            "The server returned an unexpected response.",
        );
    }

    if (!response.ok) {
        const error =
            body !== null && typeof body === "object"
                ? (body as CvErrorResponse)
                : undefined;

        throw new CvApiError(
            response.status,
            typeof error?.code === "string"
                ? error.code
                : "CV_REQUEST_FAILED",
            typeof error?.message === "string"
                ? error.message
                : `The request failed (${response.status}).`,
        );
    }

    return body as T;
}

async function getCsrfToken(): Promise<CsrfResponse> {
    const response = await fetch(`${CV_API_BASE_URL}/api/v1/csrf`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
            Accept: "application/json",
        },
    });

    const csrf = await readResponse<CsrfResponse>(response);

    if (
        typeof csrf?.headerName !== "string" ||
        !csrf.headerName ||
        typeof csrf?.token !== "string" ||
        !csrf.token
    ) {
        throw new CvApiError(
            response.status,
            "INVALID_CSRF_RESPONSE",
            "The server did not return a valid CSRF token.",
        );
    }

    return csrf;
}

type CvRequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
};

export async function cvRequest<T>(
    path: string,
    options: CvRequestOptions = {},
): Promise<T> {
    const method = options.method ?? "GET";

    const headers = new Headers({
        Accept: "application/json",
    });

    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    if (method !== "GET") {
        const csrf = await getCsrfToken();
        headers.set(csrf.headerName, csrf.token);
    }

    const response = await fetch(`${CV_API_BASE_URL}${path}`, {
        method,
        credentials: "include",
        cache: "no-store",
        headers,
        body:
            options.body === undefined
                ? undefined
                : JSON.stringify(options.body),
    });

    return readResponse<T>(response);
}