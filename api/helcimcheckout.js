export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { amount, customer, description } = req.body;

  try {
    const response = await fetch("https://api.helcim.com/v2/helcim-pay/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HELCIM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount.toString(), // ensure string format
        currency: "USD",
        paymentMethod: "cc",
        description,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
        },
        redirectUrl: "https://your-site.webflow.io/thank-you",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).json({ error: errorText });
    }

    const { checkoutToken } = await response.json();
    return res.status(200).json({ checkoutToken });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
