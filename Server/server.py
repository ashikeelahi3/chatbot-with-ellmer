from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
import os
import dotenv
from openai import OpenAI
dotenv.load_dotenv()


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    try:
        # completion = openai.ChatCompletion.create(
        #     model="gpt-40-mini",
        #     messages=[{"role": "user", "content": user_message}]
        # )
        response = client.responses.create(
          model="gpt-4o-mini",
          input=user_message
        )
        bot_reply = response.output_text
    except Exception as e:
        bot_reply = f"[OpenAI Error] {str(e)}"
    now = datetime.datetime.now().strftime('%H:%M')
    return jsonify({
        'reply': bot_reply,
        'time': now
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
