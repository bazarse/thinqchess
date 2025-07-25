export async function POST(request) {
  try {
    const body = await request.json();

    const { webAppUrl, templateParams } = body;

    if (!webAppUrl || !templateParams) {
      return new Response(
        JSON.stringify({ error: "Missing webAppUrl or templateParams" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateParams),
    });

    const text = await response.text();

    return Response.json({ message: text });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(
      JSON.stringify({ error: "Error submitting to Google Sheets" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
