import { neon } from "@neondatabase/serverless";

export async function GET(
  request: Request,
  { rideId }: { rideId: string }
) {
  if (!rideId) {
    return Response.json({ error: "Missing ride ID" }, { status: 400 });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT ride_id, payment_status
      FROM rides
      WHERE ride_id = ${rideId}
      LIMIT 1;
    `;

    return Response.json({ data: response?.[0] || null }, { status: 200 });
  } catch (error) {
    console.error("Error fetching ride status:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
