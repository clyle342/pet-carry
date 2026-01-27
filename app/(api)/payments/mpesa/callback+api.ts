import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const callback = payload?.Body?.stkCallback;

    if (!callback) {
      return Response.json({ error: "Invalid callback payload" }, { status: 400 });
    }

    const {
      CheckoutRequestID: checkoutRequestId,
      MerchantRequestID: merchantRequestId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
    } = callback;

    if (!checkoutRequestId) {
      return Response.json({ error: "Missing checkout request ID" }, { status: 400 });
    }

    const status = Number(resultCode) === 0 ? "SUCCESS" : "FAILED";
    const sql = neon(`${process.env.DATABASE_URL}`);
    const rawPayload = JSON.stringify(payload);

    const updatedPayments = await sql`
      UPDATE payments
      SET
        merchant_request_id = ${merchantRequestId},
        result_code = ${resultCode},
        result_desc = ${resultDesc},
        status = ${status},
        raw_callback_payload = ${rawPayload}
      WHERE checkout_request_id = ${checkoutRequestId}
      RETURNING booking_id;
    `;

    const bookingId = updatedPayments?.[0]?.booking_id;

    if (bookingId) {
      await sql`
        UPDATE rides
        SET payment_status = ${status}
        WHERE ride_id = ${bookingId};
      `;
    }

    return Response.json({ data: { status } }, { status: 200 });
  } catch (error) {
    console.error("Error handling M-Pesa callback:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
