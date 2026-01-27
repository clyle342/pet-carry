export async function POST() {
  return Response.json(
    {
      error: "Stripe payments are disabled. Use M-Pesa STK Push instead.",
    },
    { status: 410 }
  );
}
