import sys
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
import tensorflow as tf
from pathlib import Path

# Suppress TensorFlow/Keras progress output
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress most TF logging
tf.get_logger().setLevel('ERROR')  # Suppress TF warnings

# Image size based on your model input
image_size = (128, 128)

# Load Model
model = tf.keras.models.load_model('temp_model.keras')

def convert_to_ela_image(path, quality=90):
    temp_filename = 'temp_ela.jpg'
    ela_filename = 'temp_ela.png'

    image = Image.open(path).convert('RGB')
    image.save(temp_filename, 'JPEG', quality=quality)
    temp_image = Image.open(temp_filename)

    # Compute ELA difference
    ela_image = ImageChops.difference(image, temp_image)

    # Enhance ELA image
    extrema = ela_image.getextrema()
    max_diff = max([ex[1] for ex in extrema])
    if max_diff == 0:
        max_diff = 1
    scale = 255.0 / max_diff

    ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)

    return image, ela_image

def prepare_image(image_path):
    original_image, ela_image = convert_to_ela_image(image_path, 90)
    ela_image_resized = ela_image.resize(image_size)
    ela_array = np.array(ela_image_resized).flatten() / 255.0  # Normalize pixel values
    return ela_array.reshape(1, 128, 128, 3)  # Reshape for model input

def predict_image(image_path):
    try:
        processed_image = prepare_image(image_path)
        
        # Disable progress bar during prediction
        prediction = model.predict(processed_image, verbose=0)
        
        confidence = float(prediction[0][0])
        result = "Tampered (Fake)" if confidence > 0.5 else "Authentic (Real)"
        
        return "\n".join([
            "======== IMAGE ANALYSIS REPORT ========\n",
            f"File: {Path(image_path).name}",
            f"Prediction: {result}",
            f"Confidence: {confidence:.4f}",
            "\n======== ANALYSIS DETAILS ========\n",
            "Method: Error Level Analysis (ELA) + Deep Learning",
            "Input: 128x128 ELA-enhanced image",
            f"Threshold: 0.5 (>{0.5}=Fake, <{0.5}=Real)"
        ])
    except Exception as e:
        return f"Error processing image: {str(e)}"

def main():
    if len(sys.argv) < 2:
        return "No image path provided"
    
    image_path = sys.argv[1]
    return predict_image(image_path)

if __name__ == "__main__":
    print(main())