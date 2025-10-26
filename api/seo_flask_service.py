# Add a root route for Render deployment verification
import os
PAGESPEED_API_KEY = os.environ.get("PAGESPEED_API_KEY")

@app.route('/')
def home():
    return 'Flask is running!'
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Example: Use Google PageSpeed Insights API (replace with your API key)

PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    try:
        # Call Google PageSpeed API
        params = {
            'url': url,
            'key': PAGESPEED_API_KEY
        }
        r = requests.get(PAGESPEED_API_URL, params=params)
        r.raise_for_status()
        result = r.json()
        # You can filter/format the result here
        return jsonify(result)
    except Exception as e:
        import traceback
        print("Flask SEO Analyzer error:", str(e))
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 5001))
    app.run(host='0.0.0.0', port=port)
