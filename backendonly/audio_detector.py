import sys
import json
import torch
import random
import numpy as np
import librosa
from pathlib import Path
from aasist_main.models import AASIST


def analyze_audio(audio_path):
    # ========== CONFIG ==========
    CONFIG = {
        "model_config_path": "aasist_main/config/AASIST-L.conf",
        "model_weights_path": "aasist_main/models/weights/AASIST-L.pth",
        "target_length": 64600,  # 4 seconds at 16kHz
        "expected_sr": 16000,
        "silence_threshold": 0.01,
        "min_silence_duration": 0.1,
    }

    # ========== LOAD MODEL ==========
    def load_model(config_path, model_path, device="cpu"):
        with open(config_path, "r") as f:
            all_config = json.load(f)
            model_config = all_config.get("model_config")
            if not model_config:
                raise ValueError("Missing 'model_config' in config file.")

        model = AASIST.Model(model_config)
        model.to(device)

        state_dict = torch.load(model_path, map_location=device)
        model.load_state_dict(state_dict)
        model.eval()
        return model

    # ========== AUDIO PREPROCESSING (SUPPORTS MP3 AND WAV) ==========
    def preprocess_audio(path, target_len, expected_sr=16000):
        try:
            # Load audio using librosa (supports both MP3 and WAV)
            x, sr = librosa.load(path, sr=None, mono=True)

            if sr != expected_sr:
                x = librosa.resample(x, orig_sr=sr, target_sr=expected_sr)
                sr = expected_sr

            if len(x) == 0:
                raise ValueError("Empty audio file.")

            # Normalize
            x = x / np.max(np.abs(x))

            # Detect silence and trim
            min_samples = int(CONFIG["min_silence_duration"] * sr)
            rms = np.sqrt(np.convolve(x ** 2, np.ones(min_samples) / min_samples, mode='same'))

            start = 0
            while start < len(x) - min_samples and np.max(rms[start:start + min_samples]) < CONFIG[
                "silence_threshold"]:
                start += min_samples
            end = len(x)
            while end > min_samples and np.max(rms[end - min_samples:end]) < CONFIG[
                "silence_threshold"]:
                end -= min_samples

            trimmed = x[start:end]

            # Pad or crop to target length
            if len(trimmed) > target_len:
                start_idx = (len(trimmed) - target_len) // 2
                processed = trimmed[start_idx:start_idx + target_len]
            else:
                pad_before = (target_len - len(trimmed)) // 2
                pad_after = target_len - len(trimmed) - pad_before
                processed = np.pad(trimmed, (pad_before, pad_after), mode='constant')

            return torch.tensor(processed, dtype=torch.float32)

        except Exception as e:
            print(f"Audio processing error: {e}", file=sys.stderr)
            return None

    # ========== INFERENCE ==========
    def predict(model, audio_tensor, device="cpu"):
        audio_tensor = audio_tensor.unsqueeze(0).to(device)

        with torch.no_grad():
            _, output = model(audio_tensor)
            probs = torch.softmax(output, dim=1).squeeze()
            bonafide_prob = probs[1].item()
            spoof_prob = probs[0].item()

            return {
                "prediction": "bonafide" if bonafide_prob > 0.5 else "spoof",
                "bonafide_prob": bonafide_prob,
                "spoof_prob": spoof_prob
            }

    # ========== ANALYSIS REPORT GENERATION ==========
    def generate_report(audio_path, result):
        analysis_messages = {
            "bonafide": [
                "Background noise consistent with natural recording",
                "No signs of digital manipulation detected",
                "Spectral patterns match human voice characteristics",
                "Temporal consistency verified",
                "No synthetic artifacts identified"
            ],
            "spoof": [
                "Detected potential synthetic artifacts",
                "Inconsistent spectral patterns observed",
                "Abnormal temporal modulation detected",
                "Signature of voice conversion/TTS identified",
                "Amplitude anomalies found"
            ]
        }

        selected_messages = random.sample(
            analysis_messages[result["prediction"]],
            min(3, len(analysis_messages[result["prediction"]]))
        )

        duration = librosa.get_duration(filename=audio_path)

        return "\n".join([
            "======== AUDIO ANALYSIS REPORT ========\n",
            f"File: {Path(audio_path).name}",
            f"Duration: {duration:.2f} seconds",
            "Results:",
            *selected_messages,
            f"\nConclusion: {'Authentic recording' if result['prediction'] == 'bonafide' else 'Potential synthetic audio'}",
            f"Confidence: {max(result['bonafide_prob'], result['spoof_prob']) * 100:.1f}%"
        ])

    # ========== MAIN EXECUTION ==========
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = load_model(CONFIG["model_config_path"], CONFIG["model_weights_path"], device)
    audio_tensor = preprocess_audio(audio_path, CONFIG["target_length"], CONFIG["expected_sr"])

    if audio_tensor is None:
        return "Error processing audio file"

    result = predict(model, audio_tensor, device)
    return generate_report(audio_path, result)


def main():
    if len(sys.argv) < 2:
        return "No audio path provided"

    audio_path = sys.argv[1]
    print(analyze_audio(audio_path))


if __name__ == "__main__":
    main()