"""Flask API that serves phishing predictions to the Baitcheck frontend.

Run:  python server.py   (listens on http://localhost:5000)
"""

import os

from flask import Flask, jsonify, request

from analyzer import analyze, load_model

MAX_TEXT_LENGTH = 20_000
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "*")

app = Flask(__name__)
model = load_model()


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST", "OPTIONS"])
def analyze_message():
    if request.method == "OPTIONS":
        return ("", 204)

    payload = request.get_json(silent=True) or {}
    text = payload.get("text")

    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Request body must include a non-empty 'text' field."}), 400
    if len(text) > MAX_TEXT_LENGTH:
        return jsonify({"error": f"Text must be under {MAX_TEXT_LENGTH} characters."}), 413

    return jsonify(analyze(text, model))


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
