#!/usr/bin/env bash
# install-chatterbox.sh — local voice cloning for the voice-over: Chatterbox (Resemble AI, MIT licence, commercial
# use allowed). Replaces OpenVoice V2, whose output was noisy, oddly accented and clipped (Maxim, 2026-11-02).
# Everything lives on E: (C: is nearly full).
#
#   bash sm-content/12-kickstarter/tools/install-chatterbox.sh
#
# Then: tools/voiceover.py turns the SCRIPT.md lines + the voice sample into audio/voiceover-en.wav.
set -euo pipefail
ROOT=/e/tools/chatterbox
# This PC inspects TLS with its own root CA: Python/requests must use the Windows trust store, exported to
# E:/tools/win-ca.pem (LocalMachine Root + CurrentUser Root + LocalMachine CA). Verification stays on.
export SSL_CERT_FILE=/e/tools/win-ca.pem REQUESTS_CA_BUNDLE=/e/tools/win-ca.pem CURL_CA_BUNDLE=/e/tools/win-ca.pem
export UV_NATIVE_TLS=1 UV_CACHE_DIR=/e/tools/uv-cache UV_PYTHON_INSTALL_DIR=/e/tools/uv-python HF_HOME=/e/tools/hf-cache
mkdir -p "$ROOT" "$UV_CACHE_DIR" "$HF_HOME"
UV="python -m uv"
cd "$ROOT"
[ -d .venv ] || $UV venv --python 3.10 .venv
PY="$ROOT/.venv/Scripts/python.exe"
$UV pip install --python "$PY" chatterbox-tts
# Its watermark module (resemble-perth) imports pkg_resources, which a uv venv lacks and setuptools >= 81 dropped.
$UV pip install --python "$PY" "setuptools<81"
# Whisper (faster-whisper, MIT) checks every generated line against its text: catches clipped or garbled words.
$UV pip install --python "$PY" faster-whisper
# Model weights (ResembleAI/chatterbox on Hugging Face) are fetched once, into HF_HOME on E:.
"$PY" -c "from chatterbox.tts import ChatterboxTTS; ChatterboxTTS.from_pretrained(device='cpu'); print('Chatterbox ready')"
