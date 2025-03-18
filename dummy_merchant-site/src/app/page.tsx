//page.tsx
'use client';
import { useEffect, useState } from 'react';
import MerchantPaymentClient  from 'merchant-payment-client';

export default function Home() {
  type PaymentVerificationResponse = {
    status: string;
    timestamp: string;
    secret?: string;
  };

  const [paymentId, setPaymentId] = useState('');
  const [verificationResult, setVerificationResult] = useState<PaymentVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const publicKey = 'YOUR_PUBLIC_KEY';
      const gateway = new MerchantPaymentClient('MERCHANT_123', publicKey, 'http://localhost:8001');
      
      gateway.init();
      
      // Optional: Set up event listeners
      gateway.onPaymentEvent((event) => {
        console.log('Payment event received:', event);
        // Handle payment events here
      });
      
      // Clean up on unmount
      return () => {
        gateway.destroy();
      };
    } catch (error) {
      console.error('Failed to initialize MerchantPaymentClient:', error);
    }
  }, []);

  const handleVerifyPayment = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setVerificationResult(null);

  try {
    const response = await fetch(`http://localhost:8001/api/payments/verify/${paymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SECRET_KEY',
      },
    });

    if (!response.ok) {
      throw new Error('Payment not found or invalid request');
    }

    const data: PaymentVerificationResponse = await response.json();
    setVerificationResult(data);
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('An unknown error occurred');
    }
  }
};

  return (
    <div>
      <h1>AI Payment Demo</h1>

      <form onSubmit={handleVerifyPayment}>
        <input
          type="text"
          placeholder="Enter Payment ID"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          required
        />
        <button type="submit">Verify Payment</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {verificationResult && (
        <div>
          <h2>Payment Verification Result</h2>
          <p>Status: {verificationResult.status}</p>
          <p>Timestamp: {verificationResult.timestamp}</p>
          {verificationResult.secret && <p>Secret: {verificationResult.secret}</p>}
        </div>
      )}
    </div>
  );
}
