import argparse
import torch
from PIL import Image
from PIL import UnidentifiedImageError
from model import get_model 
from custom_dataset import get_transform 
import glob
import os
import matplotlib.pyplot as plt


def predict_single_image(image_path, model, device, transform):
    image = Image.open(image_path).convert("RGB")
    transformed_image = transform(image).unsqueeze(0).to(device)

    model.eval()
    with torch.no_grad():
        outputs = model(transformed_image)
        _, predicted = outputs.logits.max(1)
        probabilities = torch.nn.functional.softmax(outputs.logits, dim=1)

    label_map = {0: "real", 1: "fake"}
    predicted_label = label_map[predicted.item()]
    return predicted_label, probabilities, image  # return the image for display

def load_latest_model(model, device, weights_folder):
    list_of_files = glob.glob(os.path.join(weights_folder, 'model_epoch_*.pth'))
    if not list_of_files:
        raise FileNotFoundError(f"No model files found in {weights_folder}.")
    latest_file = max(list_of_files, key=os.path.getctime)
    checkpoint = torch.load(latest_file, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    return model

def main(folder_path, weights_folder):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = get_model(device)
    model = load_latest_model(model, device, weights_folder)
    transform = get_transform()
    
    image_extensions = ('*.jpg', '*.png', '*.jpeg')
    image_paths = []
    for ext in image_extensions:
        image_paths.extend(glob.glob(os.path.join(folder_path, ext)))

    if not image_paths:
        print(f"No images found in {folder_path}.")
        return

    for image_path in image_paths:
        predicted_label, probabilities, image = predict_single_image(image_path, model, device, transform)

        print(f'\nImage: {image_path}')
        print(f'Predicted label: {predicted_label}')
        print(f'Class probabilities: {probabilities}')

        # Display the image using matplotlib
        plt.imshow(image)
        plt.title(f"Prediction: {predicted_label}\nProbabilities: Real={probabilities[0][0]:.2f}, Fake={probabilities[0][1]:.2f}")
        plt.axis('off')
        plt.show()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Predict images in a folder using a trained model.')
    parser.add_argument('folder_path', type=str, help='Path to the folder containing images for prediction.')
    parser.add_argument('--weights_folder', type=str, default='./models', help='Folder path for model weights. Defaults to ./models if not provided.')

    args = parser.parse_args()
    main(args.folder_path, args.weights_folder)
