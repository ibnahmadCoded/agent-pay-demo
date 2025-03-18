# AI Payment System Demo

This repository demonstrates an AI payment infrastructure that allows AI agents to make payments on merchant websites. The system consists of three main components:

1. **Merchant Payment Client**: A JavaScript SDK for websites to accept payments from AI agents
2. **AI Payment Agent SDK**: A Python SDK for AI agents to make payments on merchant websites
3. **Payment Gateway**: A backend service that mediates between merchants and AI agents

## Payment Flow Diagram For Agent <-> Merchant Site Payment Type

```
┌─────────────┐      1. Check compatibility      ┌─────────────┐
│             │─────────────────────────────────>│             │
│  AI Agent   │                                  │  Merchant   │
│  (Python)   │<─────────────────────────────────│  Website    │
│             │      2. Merchant ID              │  (JS/Web)   │
│             │                                  │             │
└─────┬───────┘                                  └─────┬───────┘
      │                                                │
      │ 3. Initiate                                    │
      │ Payment                                        │
      │                                                │
      ▼                                                │
┌─────────────┐      4. Payment Advice      ┌─────────────────────┐
│             │─────────────────────────────>│                     │
│  Payment    │                             │ Merchant Payment     │
│  Gateway    │<────────────────────────────│ Client (on website)  │
│             │      5. Initialize Payment   │                     │
└─────┬───────┘                             └─────────────────────┘
      │                                                │
      │ 6. Initialized                                 │
      │ Notification (webhook/Polling)                                  │
      ▼                                                │
┌─────────────┐      7. Complete Payment     ┌─────────────────────┐
│  AI Agent   │─────────────────────────────>│      Payment        │
│  (Python)   │                              │      Gateway        │
└─────────────┘                              └─────┬───────────────┘
                                                   │
                                                   │ 8. Payment
                                                   │ Completion
                                                   │ Webhook
                                                   ▼
                                            ┌─────────────┐
                                            │  Merchant   │
                                            │  Website    │
                                            └─────────────┘
```

## Payment Flow Process (Rough, not exact)

1. **Compatibility Check**: The AI agent checks if the merchant website is compatible with AI payments.
2. **Merchant ID**: The merchant website returns its unique merchant ID to the AI agent.
3. **Payment Initiation**: The AI agent initiates a payment through the payment gateway, providing payment details.
4. **Payment Advice**: The payment gateway notifies the merchant site by sending the payment advice from the agent.
5. **Payment Initialization**: The merchant site initializes the payment with the payment advice and agent details through the payment gateway.
6. **Initialization Notification**: The payment gateway notifies the agent that the payment has been initialized (via webhook if registered, otherwise agent can check status).
7. **Payment Completion**: The agent completes the payment through the payment gateway.
8. **Completion Notification**: The payment gateway notifies the merchant site about payment completion (via webhook if provided).

## Components Overview

### 1. Merchant Website (Next.js)

The merchant website integrates the Merchant Payment Client SDK to accept payments from AI agents. It includes:
- A basic UI for payment verification
- A webhook endpoint for receiving payment notifications
- Methods for initializing payments

### 2. AI Agent (Flask)

The AI agent uses the Agent Payment Client SDK to make payments on merchant websites. It includes:
- Endpoints for checking website compatibility
- Methods for initiating and completing payments
- Support for webhook and direct payment flows

### 3. Payment Gateway (Backend Service)

The payment gateway acts as an intermediary between merchants and AI agents, handling:
- Payment processing
- Secure communication
- Transaction verification
- Webhook notifications

## Security Features

The system implements several security measures:

- **End-to-End Encryption**: All sensitive payment data is encrypted during transmission
- **Cryptographic Signatures**: All requests are signed to ensure authenticity
- **Payload Secrets**: Unique secrets are used to verify webhook integrity
- **Secure Communication**: Transport Layer Security (TLS) is used for all communications

## Open Source & Licensing

- **Merchant Payment Client SDK**: Open source under MIT license
- **AI Payment Agent SDK**: Open source under MIT license
- **Payment Gateway**: Closed source, but developers can create their own compatible gateway if desired

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- Python (v3.7+)
- npm
- pip

### 1. Clone this repository

```bash
git clone https://github.com/yourusername/agent-pay-demo.git
cd ai-payment-demo
```

### 2. Setting up the Merchant Website (Next.js)

You can either use the provided dummy merchant site or create your own.

#### Using the provided dummy merchant site:

```bash
cd dummy_merchant
npm install
npm run dev
```

The merchant site will be available at `http://localhost:3000`.

#### About the merchant site code:

The merchant site uses Next.js and integrates the Merchant Payment Client SDK. The main components are:

1. **page.tsx**: The main UI component that:
   - Initializes the payment client
   - Provides a form for payment verification
   - Displays payment verification results

```typescript
// Key parts of page.tsx
const gateway = new MerchantPaymentClient('MERCHANT_123', publicKey, 'http://localhost:8001');
gateway.init();

// Set up event listeners
gateway.onPaymentEvent((event) => {
  console.log('Payment event received:', event);
});
```

2. **webhook/payment/route.ts**: Handles payment notifications from the payment gateway:

```typescript
// Key parts of webhook handler
export async function POST(request: NextRequest) {
  try {
    const notification = await request.json();
    console.log('Received payment notification:', notification);
    
    if (notification.status === 'completed') {
      console.log(`Payment ${notification.payment_id} completed with secret: ${notification.secret}`);
    } else if (notification.status === 'initialized') {
      console.log(`Payment ${notification.payment_id} initialized`);
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
```

### 3. Setting up the AI Agent (Flask)

You can either use the provided dummy agent app or create your own.

#### Using the provided dummy agent app:

```bash
cd dummy_agent_app
pip install -r requirements.txt
pip install "flask[async]"
python app.py
```

The agent API will be available at `http://localhost:5000`.

#### About the agent app code:

The Flask app simulates an AI agent and provides endpoints for:

1. **Checking website compatibility**:
```python
@app.route('/check-compatibility', methods=['POST'])
async def check_compatibility():
    website_url = request.json.get('url')
    compatibility_result = await agent_client.check_website_compatibility(website_url)
    is_compatible = compatibility_result['compatible']
    return jsonify({"compatible": is_compatible})
```

2. **Initiating payments** (two methods):
   - Using webhook for initialization notification
   - Using polling for initialization status

```python
# With agent reference - polls for initialization status
@app.route('/initiate-payment-agent-ref', methods=['POST'])
async def initiate_payment_agent_ref():
    # ... check compatibility and get merchant_id
    
    # Generate unique reference
    agent_payment_reference = str(object=uuid.uuid4())
    
    # Initiate payment
    await agent_client.initiate_payment(
        merchant_id=merchant_id,
        amount=data['amount'],
        currency=data['currency'],
        agent_payment_reference=agent_payment_reference,
        description=data.get('description')
    )
    
    # Wait briefly then check status
    await asyncio.sleep(1.5)
    initialization_status = await agent_client.check_initialization_status(
        agent_payment_reference=agent_payment_reference
    )
    
    # Complete payment if initialized
    if initialization_status["status"] == "success":
        success = await agent_client.complete_payment(
            merchant_id=merchant_id,
            payment_id=initialization_status["payment_id"],
            encrypted_advice=initialization_status["encrypted_advice"],
            secret=initialization_status["secret"]
        )
        return jsonify({"success": success})
```

3. **Webhook endpoint** for receiving initialization notifications:
```python
@app.route('/webhook/payment', methods=['POST'])
async def payment_webhook():
    data = request.json
    
    if data['status'] == 'initialized':
        # Complete the payment
        success = await agent_client.complete_payment(
            merchant_id=data['merchant_id'],
            payment_id=data['payment_id'],
            encrypted_advice=data['encrypted_advice'],
            secret=data['secret']
        )
        return jsonify({"success": success})
    return jsonify({"success": True})
```

## Testing the Payment Flow

Once both the merchant site and agent app are running, you can test the payment flow using Postman or curl.

### 1. Check Website Compatibility

First, check if the merchant website is compatible with AI payments:

#### Using Postman:
- URL: `http://localhost:5000/check-compatibility`
- Method: `POST`
- Body (JSON):
```json
{
  "url": "http://localhost:3000/"
}
```

#### Using curl:
```bash
curl -X POST http://localhost:5000/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{"url": "http://localhost:3000/"}'
```

Expected response:
```json
{
  "compatible": true
}
```

### 2. Initiate Payment (Using Webhook)

This method uses the webhook for initialization notification:

#### Using Postman:
- URL: `http://localhost:5000/initiate-payment`
- Method: `POST`
- Body (JSON):
```json
{
  "url": "http://localhost:3000/",
  "amount": 100,
  "currency": "USD",
  "description": "Test payment"
}
```

#### Using curl:
```bash
curl -X POST http://localhost:5000/initiate-payment \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/",
    "amount": 100,
    "currency": "USD",
    "description": "Test payment"
  }'
```

### 3. Initiate Payment (Using Polling)

This method polls for initialization status:

#### Using Postman:
- URL: `http://localhost:5000/initiate-payment-agent-ref`
- Method: `POST`
- Body (JSON):
```json
{
  "url": "http://localhost:3000/",
  "amount": 100,
  "currency": "USD",
  "description": "Test payment"
}
```

#### Using curl:
```bash
curl -X POST http://localhost:5000/initiate-payment-agent-ref \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://localhost:3000/",
    "amount": 100,
    "currency": "USD",
    "description": "Test payment"
  }'
```

### 4. Observe the Results

Watch the console output of the merchant site. You should see a notification like:

```
Received payment notification: {
  payment_id: '2375c82b-284c-45a5-bc43-8ed11999d623',
  merchant_id: 'MERCHANT_123',
  timestamp: '2025-03-18T10:47:58.376233',
  status: 'completed',
  secret: 'd48086f62aa97d3ac67e25acadb254c02f1bb7f3be7b1c5b3f229ddc0504f60d'
}
Payment 2375c82b-284c-45a5-bc43-8ed11999d623 completed with secret: d48086f62aa97d3ac67e25acadb254c02f1bb7f3be7b1c5b3f229ddc0504f60d
POST /api/webhook/payment 200 in 15ms
```

### 5. Verify the Payment

You can verify the payment in two ways:

#### Using the UI (Manual Verification):
1. Copy the payment ID from the console output
2. Paste it into the verification form on the merchant site
3. Click "Verify Payment"

#### Using the API (Programmatic Verification):
```bash
curl -X POST http://localhost:3000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "2375c82b-284c-45a5-bc43-8ed11999d623"
  }'
```

## Security Considerations

### Key Security

- **Private Keys**: Keep private keys secure and never expose them in client-side code
- **API Keys**: Use proper authentication for all API calls
- **Payment Secrets**: Treat payment secrets as sensitive information

### Transport Security

- Use HTTPS for all communication in production environments
- Validate SSL certificates to prevent man-in-the-middle attacks

### Data Validation

- Always validate payment amounts and details on the server side
- Implement proper error handling for payment failures
- Use data sanitization to prevent injection attacks

### Cryptography

- The system uses RSA public-key cryptography for secure communication
- Encrypted advice ensures that payment information is protected
- Payment secrets provide an additional layer of verification
- Cryptographic signatures verify the authenticity of all messages

## Additional Resources

- [Merchant Payment Client Documentation](https://github.com/ibnahmadcoded/merchant-payment-client)
- [Agent Payment Client Documentation](https://github.com/ibnahmadcoded/agent-payment-client)
- Payment Gateway Backend (closed source)
- [Waitlist](https://tally.so/r/wvKeg4)

## Waitlist

Be among the first to use our infrastructure. Join the [waitlist](https://tally.so/r/wvKeg4). 

## Community

Join our community on [Discord](https://discord.gg/6C3uwQb8) and follow us on LinkedIn and X. Feel free to contribute and raise issues.

## License

- Merchant Payment Client SDK: MIT
- AI Payment Agent SDK: MIT
- Payment Gateway: Proprietary (closed source)

You are free to create your own payment gateway implementation to use with the open-source SDKs if you prefer.