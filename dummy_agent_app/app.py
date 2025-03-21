# app.py
from flask import Flask, request, jsonify
from config import TEST_PRIVATE_KEY, agent_id
from agent_payment_client import AgentPaymentClient
import uuid
import asyncio

app = Flask(__name__)

agent_client = AgentPaymentClient(agent_id, TEST_PRIVATE_KEY, "http://3.86.254.180/api")

@app.route('/check-compatibility', methods=['POST'])
async def check_compatibility():
    website_url = request.json.get('url')
    
    # Await the result of the check_website_compatibility coroutine
    compatibility_result = await agent_client.check_website_compatibility(website_url)
    
    # Access the 'compatible' field from the result
    is_compatible = compatibility_result['compatible']
    
    return jsonify({"compatible": is_compatible})

@app.route('/initiate-payment', methods=['POST']) # maybe attach a reference so that we can agent can use confirm_initialization route to check instead of webhook
async def initiate_payment():
    data = request.json

    #merchant_id = data['merchant_id']
    # First, check website compatibility
    compatibility_result = await agent_client.check_website_compatibility(data['url'])
    
    if not compatibility_result['compatible']:
        return jsonify({'error': 'Website not compatible'}), 400

    # Extract the merchant ID from the compatibility check result
    merchant_id = compatibility_result['merchantId']
    
    if not merchant_id:
        return jsonify({'error': 'Merchant ID not found on the website'}), 400

    # Now that the website is compatible and we have the merchant ID, initiate the payment
    try:
        result = await agent_client.initiate_payment(
            merchant_id=merchant_id,  # Use the merchantId obtained from compatibility check
            amount=data['amount'],
            currency=data['currency'],
            description=data.get('description')
        )
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/webhook/payment', methods=['POST']) # listen for confirmation that initiated payment was initialized. 
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

# payment flow without webhook for agent
@app.route('/initiate-payment-agent-ref', methods=['POST']) # maybe attach a reference so that we can agent can use confirm_initialization route to check instead of webhook
async def initiate_payment_agent_ref():
    data = request.json

    #merchant_id = data['merchant_id']
    # First, check website compatibility
    compatibility_result = await agent_client.check_website_compatibility(data['url'])
    
    if not compatibility_result['compatible']:
        return jsonify({'error': 'Website not compatible'}), 400

    # Extract the merchant ID from the compatibility check result
    merchant_id = compatibility_result['merchantId']
    
    if not merchant_id:
        return jsonify({'error': 'Merchant ID not found on the website'}), 400

    # Now that the website is compatible and we have the merchant ID, initiate the payment with agent ref
    agent_payment_reference = str(object=uuid.uuid4())

    try:
        await agent_client.initiate_payment(
            merchant_id=merchant_id,  # Use the merchantId obtained from compatibility check
            amount=data['amount'],
            currency=data['currency'],
            agent_payment_reference=agent_payment_reference,
            description=data.get('description')
        )

        # Wait for 1.5 seconds before checking the initialization status. in this flow, the agent is meant to check later that the payment has be initialized
        await asyncio.sleep(1.5)

        # check if it has been initialized by merchant, then complete (i.e., no webhook configured for agent, but agent must have reference)
        initialization_status = await agent_client.check_initialization_status(agent_payment_reference=agent_payment_reference)

        if initialization_status["status"] == "success":
             # Complete the payment
            success = await agent_client.complete_payment(
                merchant_id=merchant_id, 
                payment_id=initialization_status["payment_id"],
                encrypted_advice=initialization_status["encrypted_advice"],
                secret=initialization_status["secret"]
            )
            return jsonify({"success": success})
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)