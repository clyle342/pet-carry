import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json(
      { error: "Missing payment id." },
      { status: 400 }
    );
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT
        id,
        booking_id,
        phone,
        amount,
        checkout_request_id,
        merchant_request_id,
        result_code,
        result_desc,
        status
      FROM mpesa_transactions
      WHERE id = ${id};
    `;

    if (!response[0]) {
      return Response.json({ error: "Payment not found." }, { status: 404 });
    }

    return Response.json({ data: response[0] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
