import os
import base64
import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'chatbot/index.html')

@csrf_exempt
def process_input(request):
    try:
        if request.method == 'POST':
            # Get text data and image from the request
            message = request.POST.get('message', '').strip()
            image = request.FILES.get('image')

            if not message and not image:
                return JsonResponse({
                    'success': False,
                    'error': 'No input provided. Please send a message or an image.'
                }, status=400)

            # Encode the image if it exists
            encoded_image = None
            if image:
                image_data = image.read()
                encoded_image = base64.b64encode(image_data).decode('utf-8')

            # Prepare the message and image data for API call
            inputs = message
            if encoded_image:
                inputs += f"\nImage: data:image/jpeg;base64,{encoded_image}"

            # # Prepare payload and headers for the API call
            api_key = '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'
            # # Access the Hugging Face token
            # api_key = os.getenv('HF_TOKEN')
            if not api_key:
                logger.error("Hugging Face API key not found")
                return JsonResponse({
                    'success': False,
                    'error': 'API key configuration error'
                }, status=500)

            API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-11B-Vision-Instruct"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            payload = {
                "inputs": inputs,
                "parameters": {
                    "max_new_tokens": 300
                }
            }

            # Make the API request
            response = requests.post(API_URL, headers=headers, json=payload)
            logger.info(f"API call to {API_URL} with payload {payload}")

            # Check response status
            if response.status_code != 200:
                logger.error(f"Model API call failed with status {response.status_code}: {response.text}")
                return JsonResponse({
                    'success': False,
                    'error': 'Model processing failed. Please try again later.'
                }, status=response.status_code)

            # Parse the response
            try:
                response_data = response.json()
                
                # If response_data is a list, handle accordingly
                if isinstance(response_data, list) and len(response_data) > 0:
                    generated_response = response_data[0].get('generated_text', 'No response generated.')
                else:
                    generated_response = response_data.get('generated_text', 'No response generated.')
                
                return JsonResponse({
                    'success': True,
                    'response': generated_response
                })
            except requests.exceptions.JSONDecodeError as e:
                logger.error(f"Error parsing JSON response: {e}")
                logger.debug(f"Response content: {response.text}")
                return JsonResponse({
                    'success': False,
                    'error': 'Error processing model response. Invalid JSON received.'
                }, status=500)

    except Exception as e:
        logger.exception("Error processing input")
        return JsonResponse({
            'success': False,
            'error': 'An internal error occurred.'
        }, status=500)