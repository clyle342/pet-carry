import { neon } from "@neondatabase/serverless";

export async function GET(
  request: Request,
  { bookingId }: { bookingId: string }
) {
  if (!bookingId) {
    return Response.json({ error: "Missing booking ID" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT
        booking_id,
        checkout_request_id,
        merchant_request_id,
        result_code,
        result_desc,
        status,
        amount,
        phone
      FROM payments
      WHERE booking_id = ${bookingId}
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    return Response.json({ data: response?.[0] || null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching M-Pesa status:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
