import { neon } from "@neondatabase/serverless";

const getMpesaBaseUrl = () => {
  const env = process.env.MPESA_ENV ?? "sandbox";
  if (process.env.MPESA_BASE_URL) return process.env.MPESA_BASE_URL;
  return env === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
};

const formatPhone = (phone: string) => {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) {
    return `254${digits.slice(1)}`;
  }
  if (digits.startsWith("7") && digits.length === 9) {
    return `254${digits}`;
  }
  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }
  return null;
};

const getTimestamp = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const getAccessToken = async () => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("Missing M-Pesa consumer key/secret.");
  }

  const baseUrl = getMpesaBaseUrl();
  const response = await fetch(
    `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${consumerKey}:${consumerSecret}`
        ).toString("base64")}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to fetch M-Pesa access token.");
  }

  const data = await response.json();
  return data.access_token as string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, bookingId } = body;

    if (!phone || !amount || !bookingId) {
      return Response.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhone(phone);
    if (!formattedPhone) {
      return Response.json(
        { error: "Invalid phone format." },
        { status: 400 }
      );
    }

    const shortCode = process.env.MPESA_SHORTCODE;
    const passKey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortCode || !passKey || !callbackUrl) {
      return Response.json(
        { error: "Missing M-Pesa configuration." },
        { status: 500 }
      );
    }

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString(
      "base64"
    );

    const accessToken = await getAccessToken();
    const baseUrl = getMpesaBaseUrl();

    const stkResponse = await fetch(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Number(amount),
          PartyA: formattedPhone,
          PartyB: shortCode,
          PhoneNumber: formattedPhone,
          CallBackURL: callbackUrl,
          AccountReference: bookingId,
          TransactionDesc: "Pet Carry booking",
        }),
      }
    );

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      return Response.json(
        { error: stkData?.errorMessage ?? "STK push failed." },
        { status: 502 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`
      INSERT INTO mpesa_transactions (
        booking_id,
        phone,
        amount,
        checkout_request_id,
        merchant_request_id,
        status
      ) VALUES (
        ${bookingId},
        ${formattedPhone},
        ${Number(amount)},
        ${stkData.CheckoutRequestID ?? null},
        ${stkData.MerchantRequestID ?? null},
        'PENDING'
      )
      RETURNING id;
    `;

    return Response.json(
      {
        data: {
          paymentId: result[0]?.id,
          checkoutRequestId: stkData.CheckoutRequestID,
          merchantRequestId: stkData.MerchantRequestID,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("M-Pesa STK push error:", error);
    return Response.json(
      { error: "Unable to initiate M-Pesa payment." },
      { status: 500 }
    );
  }
}
