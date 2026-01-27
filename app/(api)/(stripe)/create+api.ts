export async function POST(request: Request) {
  return Response.json(
    {
      error:
        "Stripe payments are disabled. Please use the M-Pesa STK Push flow.",
    },
    { status: 410 }
  );
}
