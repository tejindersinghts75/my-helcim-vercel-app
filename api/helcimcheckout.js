import fetch from 'node-fetch';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, amount, name, email } = req.body;
    const HELCIM_API_TOKEN = process.env.HELCIM_API_TOKEN;

    // Validate required fields
    if (!token || !amount || !name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Create payment request to Helcim API
    const response = await fetch('https://api.helcim.com/v2/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${HELCIM_API_TOKEN}`
      },
      body: JSON.stringify({
        amount: parseFloat(amount),
        currency: 'CAD', // Change to your currency
        ipAddress: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
        paymentMethod: 'cc',
        cardToken: token,
        billingContact: {
          firstName: name.split(' ')[0],
          lastName: name.split(' ').slice(1).join(' '),
          email: email
        },
        // Add more details as needed (shipping, line items, etc.)
        test: false // Set to true for testing even with production account
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(400).json({ 
        success: false, 
        error: data.message || 'Payment failed' 
      });
    }

    // Successful payment
    res.status(200).json({ 
      success: true, 
      transactionId: data.transaction.transactionId 
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
};