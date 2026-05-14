#!/usr/bin/env bash
# Render build script – installs system deps + Python packages
set -o errexit

# Install tesseract for OCR on scanned PDFs and images
apt-get update && apt-get install -y tesseract-ocr

pip install --upgrade pip
pip install -r requirements.txt
