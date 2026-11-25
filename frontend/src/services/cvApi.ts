import { CvApiError, cvRequest } from "./cvApiClient";

const CV_UPLOADS_PATH = "/api/v1/cv-uploads";

export type InitializeCvUploadResponse = {
    cvId: string;
    status: string;
    upload: {
        method: string;
        url: string;
        requiredHeaders: Record<string, string>;
        expiresAt: string;
    };
};

// Fields consumed by the upload and goals screens.
// Java also returns the remaining parsed CV fields.
export type ParsedCvDetails = {
    name: string | null;
    emailId: string | null;
    mobileNo: string | null;
    location: string | null;
    matchedLocation: string | null;
    currentRole: string | null;
    yearsOfExperience: number | null;
    softwareSkills: string[] | null;
    softSkills: string[] | null;
    behaviourSkills: string[] | null;
};

export type CompleteCvUploadResponse = {
    cvId: string;
    uploadStatus: string;
    parsingStatus: string;
    uploadedAt: string;
    parsedData: ParsedCvDetails;
};

export type SaveCvGoalsRequest = {
    targetRole: string;
    minExperience: number;
    maxExperience: number | null;
    preferredLocation: string;
};

export type CvGoalsResponse = SaveCvGoalsRequest & {
    cvId: string;
    updatedAt: string;
};

export type CvAnalysisPreviewResponse = {
    cvId: string;
    targetRole: string;
    score: number;
    estimatedImprovementPoints: number | null;
    suggestedFixesCount: number | null;
    assessedSkillsCount: number | null;
};

function cvPath(cvId: string): string {
    return `${CV_UPLOADS_PATH}/${encodeURIComponent(cvId)}`;
}

function getFileContentType(file: File): string {
    if (file.type) {
        return file.type;
    }

    const name = file.name.toLowerCase();

    if (name.endsWith(".pdf")) {
        return "application/pdf";
    }

    if (name.endsWith(".docx")) {
        return (
            "application/vnd.openxmlformats-officedocument." +
            "wordprocessingml.document"
        );
    }

    throw new Error("Please select a PDF or DOCX file.");
}

async function initializeUpload(
    file: File,
): Promise<InitializeCvUploadResponse> {
    return cvRequest<InitializeCvUploadResponse>(CV_UPLOADS_PATH, {
        method: "POST",
        body: {
            fileName: file.name,
            contentType: getFileContentType(file),
            sizeBytes: file.size,
        },
    });
}

async function uploadFile(
    file: File,
    upload: InitializeCvUploadResponse["upload"],
): Promise<void> {
    // Send the actual file directly to Azure.
    // Do not attach application cookies, bearer tokens or CSRF tokens.
    const response = await fetch(upload.url, {
        method: upload.method,
        headers: upload.requiredHeaders,
        credentials: "omit",
        body: file,
    });

    if (!response.ok) {
        throw new CvApiError(
            response.status,
            "CV_FILE_UPLOAD_FAILED",
            "The CV file could not be uploaded. Please try again.",
        );
    }
}

function completeUpload(
    cvId: string,
): Promise<CompleteCvUploadResponse> {
    return cvRequest<CompleteCvUploadResponse>(
        `${cvPath(cvId)}/complete`,
        {
            method: "POST",
        },
    );
}

function saveGoals(
    cvId: string,
    goals: SaveCvGoalsRequest,
): Promise<CvGoalsResponse> {
    return cvRequest<CvGoalsResponse>(`${cvPath(cvId)}/goals`, {
        method: "PUT",
        body: goals,
    });
}

function analyze(
    cvId: string,
): Promise<CvAnalysisPreviewResponse> {
    return cvRequest<CvAnalysisPreviewResponse>(
        `${cvPath(cvId)}/analysis`,
        {
            method: "POST",
        },
    );
}

function getPreview(
    cvId: string,
): Promise<CvAnalysisPreviewResponse> {
    return cvRequest<CvAnalysisPreviewResponse>(
        `${cvPath(cvId)}/analysis/preview`,
    );
}

export const cvApi = {
    initializeUpload,
    uploadFile,
    completeUpload,
    saveGoals,
    analyze,
    getPreview,
};