export class ApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export async function parseJsonBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.toLowerCase().includes("application/json");

  if (!isJson) {
    const text = await response.text();
    throw new ApiError("Expected JSON response from server.", response.status, {
      message: "Expected JSON response from server.",
      raw: text,
    });
  }

  return response.json();
}

export async function parseJsonResponse(response: Response) {
  const payload = await parseJsonBody(response);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || payload?.error || "Request failed.",
      response.status,
      payload
    );
  }

  return payload;
}
