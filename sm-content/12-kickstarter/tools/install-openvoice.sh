#!/usr/bin/env bash
# install-openvoice.sh — local, free voice cloning for narration (OpenVoice V2, MIT; MeloTTS, MIT).
# Everything lives on E: (C: is nearly full): Python 3.10 via uv, the venv, model checkpoints, HF and pip caches.
#
#   bash sm-content/12-kickstarter/tools/install-openvoice.sh
#
# Then: tools/narrate.py turns SCRIPT lines + audio/voice-sample.* into audio/narration-{en,fr}.wav.
set -euo pipefail
ROOT=/e/tools/openvoice
# This PC inspects TLS with its own root CA: Python/requests must use the Windows trust store, exported to
# E:/tools/win-ca.pem (LocalMachine Root + CurrentUser Root + LocalMachine CA). Verification stays on.
export SSL_CERT_FILE=/e/tools/win-ca.pem REQUESTS_CA_BUNDLE=/e/tools/win-ca.pem CURL_CA_BUNDLE=/e/tools/win-ca.pem
export UV_NATIVE_TLS=1 UV_CACHE_DIR=/e/tools/uv-cache UV_PYTHON_INSTALL_DIR=/e/tools/uv-python HF_HOME=/e/tools/hf-cache PIP_NO_CACHE_DIR=1
mkdir -p "$ROOT" "$UV_CACHE_DIR" "$UV_PYTHON_INSTALL_DIR" "$HF_HOME"
python -m pip install --quiet --user uv
UV="python -m uv"
cd "$ROOT"
[ -d OpenVoice ] || git clone --depth 1 https://github.com/myshell-ai/OpenVoice.git
[ -d MeloTTS ] || git clone --depth 1 https://github.com/myshell-ai/MeloTTS.git
[ -d .venv ] || $UV venv --python 3.10 .venv
PY="$ROOT/.venv/Scripts/python.exe"
$UV pip install --python "$PY" torch torchaudio --index-url https://download.pytorch.org/whl/cpu
$UV pip install --python "$PY" -e ./MeloTTS
# OpenVoice pins faster-whisper==0.9.0 → av 10, which no longer builds: install it without its pins and add
# the same dependencies in current, prebuilt versions.
$UV pip install --python "$PY" --no-deps -e ./OpenVoice
$UV pip install --python "$PY" "faster-whisper>=1.0.3" whisper-timestamped librosa pydub wavmark eng_to_ipa inflect unidecode pypinyin cn2an jieba langid
[ -f .venv/Lib/site-packages/unidic/dicdir/mecabrc ] || "$PY" -m unidic download   # 526 MB, once
# The S3 bucket in OpenVoice's README is gone (NoSuchBucket, 2026-11): the same V2 checkpoints are on Hugging Face.
[ -f OpenVoice/checkpoints_v2/converter/checkpoint.pth ] || "$PY" -c "from huggingface_hub import snapshot_download; snapshot_download('myshell-ai/OpenVoiceV2', local_dir='OpenVoice/checkpoints_v2')"
"$PY" -c "import torch, melo, openvoice; print('OpenVoice ready · torch', torch.__version__)"
