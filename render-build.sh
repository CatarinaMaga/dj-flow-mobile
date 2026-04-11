#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Instalar ffmpeg se não existir (Render environment)
if ! command -v ffmpeg &> /dev/null
then
    echo "Instalando FFmpeg..."
    # No Render free tier, o apt-get pode ser restrito, mas tentamos o binário estático se falhar
    # Mas a forma mais comum é via build command no ambiente Ubuntu do Render
    # Tentaremos baixar o binário estático para garantir funcionamento
    mkdir -p bin
    curl -L https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar xJ -C bin --strip-components 1
    export PATH=$PATH:$(pwd)/bin
else
    echo "FFmpeg já instalado."
fi
