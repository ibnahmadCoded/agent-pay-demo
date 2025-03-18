// src/app/api/webhook/payment/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface PaymentNotification {
  payment_id: string;
  merchant_id: string;
  status: 'initialized' | 'completed';
  timestamp: string;
  agent_id?: string;
  encrypted_advice?: string;
  secret?: string;
}

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json() //as PaymentNotification;

    // Log the payment notification
    console.log('Received payment notification:', notification);

    // Handle different payment statuses
    if (notification.status === 'completed') {
      console.log(`Payment ${notification.payment_id} completed with secret: ${notification.secret}`);
      // Handle payment completion
    } else if (notification.status === 'initialized') {
      console.log(`Payment ${notification.payment_id} initialized`);
      // Handle payment initialization
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}