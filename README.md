# Forensics App – Mobile Application for AI-Generated Content Detection

## Introduction

The rapid advancement of deep learning and artificial intelligence (AI) has led to the rise of sophisticated methods for generating synthetic digital media. This presents new challenges in verifying the authenticity of audio and image content. To address this, we introduce the **Forensics App** — a mobile application designed to detect and analyze AI-generated or tampered visual and vocal data.

## Objective

To provide a robust mobile tool capable of verifying the authenticity of digital audio and images by identifying AI manipulation or forgery using modern forensic techniques and deep learning.

## System Architecture

The application is built using a **client-server architecture**:

- **Frontend:** Developed using **React Native (Expo)** for cross-platform mobile support.
- **Backend:** A **Python Flask server** that acts as middleware between the frontend and the forensic models.
- **Models:** Two separate AI models:
  - One for analyzing **images**.
  - One for analyzing **audio**.

## Key Features

### Visual Forensics

- Pixel pattern and lighting anomaly detection
- Metadata analysis
- Error Level Analysis (ELA)
- Detection of AI-generated image traits (e.g., irregular shadows, texture inconsistencies)

### Audio Forensics

- Voice authenticity verification
- Differentiation between real human speech and AI-generated speech using machine learning models

## Technologies Used

- **React Native (Expo)** – Mobile app development
- **Python + Flask** – API server and model handler
- **Deep Learning Models** – For image and voice classification
- **Git LFS & BFG Repo-Cleaner** – For managing large model files (`.pth`, `.keras`)
- **GitHub** – Code hosting and version control

## Applications

- Fake news detection
- Media verification for journalism
- Digital content validation for legal and academic purposes
- Voice authentication in security-sensitive systems

## Conclusion

In an age where misinformation can spread rapidly through manipulated media, the **Forensics App** offers a critical solution. By leveraging deep learning and AI-powered forensics, it empowers users to distinguish between genuine and synthetic content, ensuring trust in digital communication.
