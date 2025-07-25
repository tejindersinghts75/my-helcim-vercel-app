// /api/helcim-checkout.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: 'Method not allowed' });

  const { amount, customer, description } = req.body;

  // Make call to Helcim API
  const response = await fetch('https://api.helcim.com/v1/checkout/init', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HELCIM_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount,
      currency: 'USD',
      paymentMethod: 'CC',
      description,
      customer,
      redirectUrl: "https://your-site.webflow.io/thank-you"
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return res.status(500).json({ error });
  }

  const { checkoutToken } = await response.json();
  res.status(200).json({ checkoutToken });
}
