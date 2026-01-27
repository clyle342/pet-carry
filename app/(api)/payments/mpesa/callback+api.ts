import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return Response.json(
        { error: "Invalid callback payload." },
        { status: 400 }
      );
    }

    const {
      CheckoutRequestID: checkoutRequestId,
      MerchantRequestID: merchantRequestId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
    } = stkCallback;

    const status = Number(resultCode) === 0 ? "SUCCESS" : "FAILED";
    const sql = neon(`${process.env.DATABASE_URL}`);

    const updateResult = await sql`
      UPDATE mpesa_transactions
      SET
        result_code = ${resultCode},
        result_desc = ${resultDesc},
        status = ${status},
        raw_callback_payload = ${JSON.stringify(body)}
      WHERE checkout_request_id = ${checkoutRequestId}
        OR merchant_request_id = ${merchantRequestId}
      RETURNING booking_id;
    `;

    const bookingId = updateResult[0]?.booking_id;
    if (bookingId) {
      await sql`
        UPDATE rides
        SET payment_status = ${status === "SUCCESS" ? "paid" : "failed"}
        WHERE ride_id = ${bookingId};
      `;
    }

    return Response.json({ data: { status } }, { status: 200 });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
