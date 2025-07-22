import sys
import torch
import argparse
from PIL import Image
from ai_image_detector.model import get_model
from ai_image_detector.custom_dataset import get_transform
import os
import glob

def predict_single_image(image_path, model, device, transform):
    try:
        image = Image.open(image_path).convert("RGB")
        transformed_image = transform(image).unsqueeze(0).to(device)

        model.eval()
        with torch.no_grad():
            outputs = model(transformed_image)
            _, predicted = outputs.logits.max(1)
            probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)

        # label_map = {0: "Authentic", 1: "AI-Generated"}   # flipped logic
        label_map = {0: "AI-Generated", 1: "Authentic"}
        predicted_label = label_map[predicted.item()]
        return predicted_label, probabilities, None
    except Exception as e:
        return f"Error: {str(e)}", None, None

def load_model(model, device, weights_folder='./model'):
    try:
        
        weights_folder = os.path.join(os.path.dirname(__file__), 'ai_image_detector', 'model')

        # Directly specify the file path
        model_file = os.path.join(weights_folder, 'model_epoch_24.pth')

        if not os.path.exists(model_file):
            print(model_file)
            print(f"Error: Model file {model_file} not found.")
            return f"Error: Model file {model_file} not found."
        checkpoint = torch.load(model_file, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])

        return model
        
    except Exception as e:
        return f"Error loading model: {str(e)}"

def generate_report(image_path, predicted_label, probabilities):
    
    """Generate a detailed forensic report based on model prediction"""
    
    # prob_real = probabilities[0][0].item() * 100  # flipped logic
    # prob_fake = probabilities[0][1].item() * 100  # flipped logic

    prob_fake = probabilities[0][0].item() * 100
    prob_real = probabilities[0][1].item() * 100
    
    report = [
        "====== AI IMAGE FORENSIC ANALYSIS ======\n",
        f"File: {os.path.basename(image_path)}",
        f"Prediction: {predicted_label}",
        f"Confidence Scores:",
        f"  Authentic: {prob_real:.2f}%",
        f"  AI-Generated: {prob_fake:.2f}%",
        "",
        "Detailed Findings:",
        f"- The image shows characteristics consistent with {predicted_label.lower()} content",
        f"- The model confidence level is {'high' if max(prob_real, prob_fake) > 85 else 'moderate'}",
        f"- Forensic artifacts suggest {'natural capture patterns' if predicted_label == 'Authentic' else 'synthetic generation patterns'}",
        "",
        "Conclusion:",
        f"This image is likely {predicted_label.lower()} based on deep forensic analysis."
    ]
    
    return "\n".join(report)

def main(image_path):
    # Set up device
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Initialize model
    model = get_model(device)
    
    # Load trained weights
    model = load_model(model, device)
    if isinstance(model, str):
        return model  # Return error message
    
    # Get image transformations
    transform = get_transform()
    
    # Make prediction
    predicted_label, probabilities, _ = predict_single_image(image_path, model, device, transform)
    
    if predicted_label.startswith("Error"):
        return predicted_label
    
    # Generate detailed report
    return generate_report(image_path, predicted_label, probabilities)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='AI Image Forensic Analysis')
    parser.add_argument('image_path', help='Path to image file')
    args = parser.parse_args()
    
    result = main(args.image_path)
    print(result)