from flask import Flask, request, jsonify
from flask_cors import CORS
import netifaces
import subprocess
import tempfile
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

@app.route('/api/process/ai-image', methods=['POST'])
def process_ai_image():
    return process_file('ai-image', 'ai_image_detector_integration.py')

@app.route('/api/process/forged-image', methods=['POST'])
def process_forged_image():
    return process_file('forged-image', 'forged_image_detector.py')

# API in case we use old version again:
@app.route('/api/process/image', methods=['POST'])
def process_forged_image_legacy():
    return process_file('image', 'forged_image_detector.py')

@app.route('/api/process/audio', methods=['POST'])
def process_audio():
    return process_file('audio', 'audio_detector.py')

@app.route('/api/server-info', methods=['GET'])
def server_info():
    return jsonify({
        'ip': get_local_ip(),
        'port': 80,
        'status': 'running',
        'name': 'Forensic Analysis Server'
    })

def get_local_ip():
    """Get the most probable local IP address"""
    try:
        # Get all network interfaces
        interfaces = netifaces.interfaces()
        
        # Preferred interface names in order of priority
        preferred_interfaces = ['wlan0', 'en0', 'eth0', 'enp0s3']
        
        for interface in preferred_interfaces:
            if interface in interfaces:
                addrs = netifaces.ifaddresses(interface)
                if netifaces.AF_INET in addrs:
                    return addrs[netifaces.AF_INET][0]['addr']
        
        # Fallback to first non-localhost IPv4 address
        for interface in interfaces:
            if interface == 'lo':
                continue
            addrs = netifaces.ifaddresses(interface)
            if netifaces.AF_INET in addrs:
                for addr in addrs[netifaces.AF_INET]:
                    ip = addr['addr']
                    if not ip.startswith('127.'):
                        return ip
        
        return "127.0.0.1"
    except:
        return "127.0.0.1"

def process_file(file_type, script_name):
    if 'file' not in request.files:
        return jsonify(success=False, error=f"No {file_type} file uploaded"), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify(success=False, error="Empty filename"), 400

    # Create temp directory
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        file.save(file_path)

        try:
            result = subprocess.run(
                ['python', script_name, file_path],
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
    app.run(host='0.0.0.0', port=80)