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

## Payment Flow Process

1. **Compatibility Check**: The AI agent checks if the merchant website is compatible with AI payments.
2. **Merchant ID**: The merchant website returns its unique merchant ID to the AI agent.
3. **Payment Initiation**: The AI agent initiates a payment through the payment gateway, providing payment details.
4. **Payment Advice**: The payment gateway notifies the merchant site by sending the payment advice from the agent.
5. **Payment Initialization**: The merchant site initializes the payment with the payment advice and agent details through the payment gateway.
6. **Initialization Notification**: The payment gateway notifies the agent that the payment has been initialized (via webhook if registered, otherwise agent can check status).
7. **Payment Completion**: The agent completes the payment through the payment gateway.
8. **Completion Notification**: The payment gateway notifies the merchant site about payment completion (via webhook if provided).

NOTE: this demo and process artifacts are for the Agent <-> Merchant Website payment type only. Other processes will be published on our official website. 

## Components Overview

### 1. Merchant Website (Next.js)

The merchant website integrates the Merchant Payment Client SDK to accept payments from AI agents. It includes:
- A basic UI for payment verification
- A webhook endpoint for receiving payment notifications

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
git clone https://github.com/ibnahmadcoded/agent-pay-demo.git
cd agent-pay-demo
```

### 2. Setting up the Merchant Website (Next.js)

You can either use the provided dummy merchant site or create your own.

#### Using the provided dummy merchant site:

First, choose a Merchant ID for the demo. You can use any ID you want as this is a test environment.

1. Open `page.tsx` and update the following line:
```typescript
const gateway = new MerchantPaymentClient('YOUR_MERCHANT_ID', publicKey, 'http://3.86.254.180');
```
Replace `'YOUR_MERCHANT_ID'` with your chosen merchant ID. Do not modify any other part of this line.

> Note: The server is already live at the provided IP address, but you can use your own gateway if desired.

2. Install dependencies and start the merchant site:
```bash
cd dummy_merchant_site
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

2. **webhook/payment/route.ts**: Handles payment notifications from the payment gateway

### 3. Setting up the AI Agent (Flask)

You can either use the provided dummy agent app or create your own.

#### Using the provided dummy agent app:

1. Open `config.py` and change the agent_id to any desired agent ID:
```python
# Edit only the agent_id; do not change any other configuration
agent_id = "YOUR_AGENT_ID"
```

2. Install dependencies and start the agent app:
```bash
cd dummy_agent_app
pip install -r requirements.txt
pip install "flask[async]"
python app.py
```

The agent API will be available at `http://localhost:5000`.

### 4. Setting up ngrok for Webhook Support

Before testing the payment flow, you need to expose your local services to the internet using ngrok. This is necessary because webhooks cannot be sent to localhost addresses for security reasons.

1. Download and install ngrok from [https://ngrok.com/download](https://ngrok.com/download)

2. Create an ngrok configuration file (`ngrok.yml`):
```yaml
version: "3"
agent:
    authtoken: YOUR_TOKEN

tunnels:
    flask_app:
        addr: 5000
        proto: http
    nextjs_app:
        addr: 3000
        proto: http
```

3. Start ngrok tunnels:
```bash
ngrok start --all
```

4. Note down the generated ngrok URLs for both services.

### 5. Configuring Webhooks

Once both services are running and exposed via ngrok, you need to configure the webhooks:

#### For the Agent Webhook:

Using Postman or curl, send a POST request to:
```
http://3.86.254.180/api/payments/webhooks/configure
```

With the following payload:
```json
{
    "entity_id": "YOUR_AGENT_ID",
    "entity_type": "agent",
    "webhook_url": "YOUR_NGROK_URL_FOR_FLASK/webhook/payment"
}
```

Add the header:
```
Authorization: Bearer YOUR_PUBLIC_KEY
```

#### For the Merchant Webhook:

Send another POST request to the same endpoint:
```
http://3.86.254.180/api/payments/webhooks/configure
```

With the following payload:
```json
{
    "entity_id": "YOUR_MERCHANT_ID",
    "entity_type": "merchant",
    "webhook_url": "YOUR_NGROK_URL_FOR_NEXTJS/api/webhook/payment"
}
```

With the same header:
```
Authorization: Bearer YOUR_PUBLIC_KEY
```

For both requests, you should receive a response:
```json
{
    "status": "configured"
}
```

## Testing the Payment Flow

Once both the merchant site and agent app are running and the webhooks are configured, you can test the payment flow using Postman or curl.

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
- Heads up, the test environment using http for transport

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

Join our community on [Discord](https://discord.gg/6C3uwQb8) and follow us on [LinkedIn](https://www.linkedin.com/company/placidpay) and [X](https://x.com/aaalege). Feel free to contribute and raise issues on any of the open sourced repositories.

## License

- Merchant Payment Client SDK: MIT
- AI Payment Agent SDK: MIT
- Payment Gateway: Proprietary (closed source)

You are free to create your own payment gateway implementation to use with the open-source SDKs if you prefer.