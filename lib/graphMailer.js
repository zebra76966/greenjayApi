async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID,
    client_secret: process.env.MS_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });

  const res = await fetch(`https://login.microsoftonline.com/${process.env.MS_TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error_description || "Failed to get access token");
  }

  return data.access_token;
}

export async function sendMail({ subject, body, replyTo }) {
  const token = await getAccessToken();

  const res = await fetch(`https://graph.microsoft.com/v1.0/users/${process.env.MAIL_SENDER}/sendMail`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: {
          contentType: "Text",
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: process.env.MAIL_SENDER,
            },
          },
        ],
        replyTo: replyTo
          ? [
              {
                emailAddress: {
                  address: replyTo,
                },
              },
            ]
          : [],
      },
      saveToSentItems: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
}
