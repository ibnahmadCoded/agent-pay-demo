'use client';
import { useEffect, useState } from 'react';
import MerchantPaymentClient from 'merchant-payment-client';
import { CheckCircle, AlertCircle } from 'lucide-react';

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
      
      const gateway = new MerchantPaymentClient('MERCHANT_123', publicKey, 'http://3.86.254.180');
      
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
      //const response = await fetch(`http://localhost:8001/api/payments/verify/${paymentId}`, {
      const response = await fetch(`http://3.86.254.180/api/payments/verify/${paymentId}`, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">AI Agent Payment Demo</h1>
        
        <form onSubmit={handleVerifyPayment} className="mb-6">
          <div className="mb-4">
            <label htmlFor="paymentId" className="block text-sm font-medium text-gray-700 mb-1">
              Payment ID
            </label>
            <input
              id="paymentId"
              type="text"
              placeholder="Enter your payment ID"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Verify Payment
          </button>
        </form>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}
        
        {verificationResult && (
          <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-100">
            <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
              <CheckCircle className="text-green-500 mr-2" size={20} />
              Payment Verification Result
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`font-bold ${verificationResult.status === 'successful' ? 'text-green-600' : 'text-blue-600'}`}>
                  {verificationResult.status}
                </span>
              </div>
              <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm">
                <span className="font-medium text-gray-600">Timestamp:</span>
                <span className="text-gray-800">{verificationResult.timestamp}</span>
              </div>
              {verificationResult.secret && (
                <div className="flex flex-col bg-white p-3 rounded-lg shadow-sm">
                  <span className="font-medium text-gray-600 mb-1">Secret:</span>
                  <div className="w-full overflow-hidden">
                    <span className="font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded block overflow-x-auto whitespace-normal break-all">
                      {verificationResult.secret}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}