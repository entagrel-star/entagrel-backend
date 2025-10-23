from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Example: Use Google PageSpeed Insights API (replace with your API key)
PAGESPEED_API_KEY = 'AQ.Ab8RN6LRuooKBHPbFFQZGt9HfWmqfq8HFKJQ0-6B8AABem-x8A'
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
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
