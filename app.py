import json
import sys
from pathlib import Path
from flask import Flask, render_template, jsonify

sys.path.insert(0, str(Path(__file__).parent))

with open("data/processed.json") as f:
    DATA = json.load(f)

app = Flask(__name__, template_folder=".", static_folder="views", static_url_path="/views")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/data")
def data():
    return jsonify(DATA)

if __name__ == "__main__":
    app.run(debug=True, port=5050)