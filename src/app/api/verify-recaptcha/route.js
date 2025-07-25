// app/api/verify-recaptcha/route.js
export async function POST(request) {
  const body = await request.json();
  const token = body.token;

  const apiKey = process.env.RECAPTCHA_ENTERPRISE_API_KEY;
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  const projectId = process.env.RECAPTCHA_PROJECT_ID;

  try {
    const response = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: {
            token: token,
            siteKey: siteKey,
            expectedAction: "submit",
          },
        }),
      }
    );

    const data = await response.json();

    if (data.tokenProperties?.valid && data.riskAnalysis?.score > 0.5) {
      return Response.json({ success: true, score: data.riskAnalysis.score });
    } else {
      return Response.json(
        {
          success: false,
          errorCodes: data.tokenProperties?.invalidReason || "low-score",
          score: data.riskAnalysis?.score || 0,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
