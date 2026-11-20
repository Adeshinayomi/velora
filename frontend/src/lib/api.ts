const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

type ApiOptions = RequestInit & {
  params?: Record<string, string | number | boolean | undefined>;
};

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { params, headers, ...requestOptions } = options;

  const url = new URL(`${API_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    ...requestOptions,
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(requestOptions.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...headers,
    },
  });

  if (response.status === 304) {
    throw new Error("Received an unexpected 304 response. Retry the request.");
  }

  const data = response.status === 204
    ? null
    : await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Something went wrong");
  }

  return data as T;
}