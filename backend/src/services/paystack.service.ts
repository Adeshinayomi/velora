
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    gateway_response: string;
  };
}

const getSecretKey = (): string => {
  const key = process.env.PAYSTACK_SECRET_KEY;

  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  return key;
};

export const initializePaystackTransaction = async (
  email: string,
  amount: number,
  reference: string,
  orderId: string
) => {
  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100),
        currency: process.env.CURRENCY || "NGN",
        reference,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: { orderId },
      }),
    }
  );

  const result =
    (await response.json()) as PaystackInitializeResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Payment initialization failed");
  }

  return result.data;
};

export const verifyPaystackTransaction = async (
  reference: string
) => {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  );

  const result = (await response.json()) as PaystackVerifyResponse;

  if (!response.ok || !result.status || !result.data) {
    throw new Error(result.message || "Payment verification failed");
  }

  return result.data;
};
