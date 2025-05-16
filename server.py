from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/', methods=['GET', 'HEAD'])
def health_check():
    return jsonify({"status": "running"})

@app.route('/api/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify(success=False, error="No file uploaded"), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, error="Empty filename"), 400

    # Create temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)

        try:
            result = subprocess.run(
                ['python', 'placeholder-script-for-AI.py', file_path],
                capture_output=True,
                text=True,
                check=True
            )
            return jsonify(
                success=True,
                output=result.stdout
            )
        except subprocess.CalledProcessError as e:
            return jsonify(
                success=False,
                error=f"Script error: {e.stderr}"
            ), 500
        except Exception as e:
            return jsonify(
                success=False,
                error=f"Server error: {str(e)}"
            ), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)