import { neon } from "@neondatabase/serverless";

import {
  getMpesaAccessToken,
  getMpesaBaseUrl,
  getMpesaPassword,
  getMpesaTimestamp,
  normalizeMpesaPhone,
} from "@/lib/mpesa";

const isValidMpesaPhone = (value: string) => /^254[71]\d{8}$/.test(value);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, phone, amount, customerName } = body;

    if (!bookingId || !phone || !amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizeMpesaPhone(String(phone));

    if (!isValidMpesaPhone(normalizedPhone)) {
      return Response.json(
        { error: "Invalid Safaricom phone number" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;

    if (!shortcode || !passkey || !callbackUrl) {
      return Response.json(
        { error: "Missing M-Pesa configuration" },
        { status: 500 }
      );
    }

    const timestamp = getMpesaTimestamp();
    const password = getMpesaPassword(shortcode, passkey, timestamp);
    const accessToken = await getMpesaAccessToken();

    const stkResponse = await fetch(
      `${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          BusinessShortCode: shortcode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: "CustomerPayBillOnline",
          Amount: Math.round(numericAmount),
          PartyA: normalizedPhone,
          PartyB: shortcode,
          PhoneNumber: normalizedPhone,
          CallBackURL: callbackUrl,
          AccountReference: `booking-${bookingId}`,
          TransactionDesc: customerName || "Pet Carry booking",
        }),
      }
    );

    const stkPayload = await stkResponse.json();

    if (!stkResponse.ok) {
      return Response.json(
        {
          error: stkPayload?.errorMessage || "Failed to initiate STK Push",
          details: stkPayload,
        },
        { status: 502 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);

    await sql`
      INSERT INTO payments (
        booking_id,
        phone,
        amount,
        checkout_request_id,
        merchant_request_id,
        status
      ) VALUES (
        ${bookingId},
        ${normalizedPhone},
        ${Math.round(numericAmount)},
        ${stkPayload.CheckoutRequestID},
        ${stkPayload.MerchantRequestID},
        ${"PENDING"}
      );
    `;

    await sql`
      UPDATE rides
      SET payment_status = ${"PENDING"}
      WHERE ride_id = ${bookingId};
    `;

    return Response.json(
      {
        data: {
          checkoutRequestId: stkPayload.CheckoutRequestID,
          merchantRequestId: stkPayload.MerchantRequestID,
          responseCode: stkPayload.ResponseCode,
          responseDescription: stkPayload.ResponseDescription,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error initiating M-Pesa STK push:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
