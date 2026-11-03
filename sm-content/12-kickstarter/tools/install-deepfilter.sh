#!/usr/bin/env bash
# install-deepfilter.sh — DeepFilterNet3 (MIT / Apache-2.0): neural speech enhancement, removes room tone, hiss and
# air noise from the voice sample before cloning (Maxim, 2026-11-03: "work the source sample to eliminate any noise").
# Its pip release needs torchaudio < 2.1, so it gets its own venv. Everything on E: (C: is nearly full).
#
#   bash sm-content/12-kickstarter/tools/install-deepfilter.sh
set -euo pipefail
ROOT=/e/tools/deepfilter
export SSL_CERT_FILE=/e/tools/win-ca.pem REQUESTS_CA_BUNDLE=/e/tools/win-ca.pem CURL_CA_BUNDLE=/e/tools/win-ca.pem
export UV_NATIVE_TLS=1 UV_CACHE_DIR=/e/tools/uv-cache UV_PYTHON_INSTALL_DIR=/e/tools/uv-python
mkdir -p "$ROOT"
UV="python -m uv"
cd "$ROOT"
[ -d .venv ] || $UV venv --python 3.10 .venv
PY="$ROOT/.venv/Scripts/python.exe"
$UV pip install --python "$PY" "torch==2.0.1" "torchaudio==2.0.2" --index-url https://download.pytorch.org/whl/cpu
$UV pip install --python "$PY" deepfilternet "numpy<2" soundfile
"$PY" -c "from df.enhance import init_df; init_df(); print('DeepFilterNet ready')"
