
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, message: "Backend URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const { path } = await context.params;

    const incomingUrl = new URL(request.url);

    const backendUrl = new URL(
      `/api/${path.join("/")}${incomingUrl.search}`,
      BACKEND_URL
    );

    const headers = new Headers();

    const headersToForward = [
      "content-type",
      "authorization",
      "cookie",
      "x-checkout-token",
      "paystack-signature",
    ];

    headersToForward.forEach((name) => {
      const value = request.headers.get(name);

      if (value) {
        headers.set(name, value);
      }
    });

    const upstreamResponse = await fetch(backendUrl, {
      method: request.method,
      headers,
      body:
        request.method === "GET" || request.method === "HEAD"
          ? undefined
          : await request.arrayBuffer(),
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();

    upstreamResponse.headers.forEach((value, key) => {
      if (
        ![
          "connection",
          "transfer-encoding",
          "content-encoding",
        ].includes(key.toLowerCase()) &&
        key.toLowerCase() !== "set-cookie"
      ) {
        responseHeaders.set(key, value);
      }
    });

    // Explicitly forward authentication cookies.
    const cookies = upstreamResponse.headers.getSetCookie();

    cookies.forEach((cookie) => {
      responseHeaders.append("Set-Cookie", cookie);
    });

    responseHeaders.set("Cache-Control", "no-store");

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("API proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach backend" },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
