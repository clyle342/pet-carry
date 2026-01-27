import { Buffer } from "buffer";

const padTime = (value: number) => String(value).padStart(2, "0");

export const getMpesaBaseUrl = () => {
  const env = (process.env.MPESA_ENV || "sandbox").toLowerCase();
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

export const getMpesaTimestamp = (date = new Date()) => {
  return `${date.getFullYear()}${padTime(date.getMonth() + 1)}${padTime(
    date.getDate()
  )}${padTime(date.getHours())}${padTime(date.getMinutes())}${padTime(
    date.getSeconds()
  )}`;
};

export const getMpesaPassword = (
  shortcode: string,
  passkey: string,
  timestamp: string
) => {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
};

export const normalizeMpesaPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith("7") && digits.length === 9) return `254${digits}`;
  if (digits.startsWith("1") && digits.length === 9) return `254${digits}`;
  return digits;
};

export const getMpesaAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa consumer key or secret.");
  }

  const credentials = Buffer.from(
    `${consumerKey}:${consumerSecret}`
  ).toString("base64");

  const response = await fetch(
    `${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to obtain M-Pesa token: ${errorBody}`);
  }

  const data = await response.json();
  return data.access_token as string;
};
