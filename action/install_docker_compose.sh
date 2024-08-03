#!/bin/bash

# 檢查 docker-compose 是否已安裝
if ! command -v docker-compose &> /dev/null; then
  echo "docker-compose 未安裝，正在安裝..."

  # 安裝 docker-compose 的必要套件
  sudo apt update
  sudo apt install -y curl wget python3-pip

  # 從 GitHub 下載最新版本的 docker-compose
  LATEST_RELEASE=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
  DOWNLOAD_URL="https://github.com/docker/compose/releases/download/${LATEST_RELEASE}/docker-compose-Linux-x86_64"

  # 下載 docker-compose
  sudo curl -L "$DOWNLOAD_URL" -o /usr/local/bin/docker-compose

  # 設定權限
  sudo chmod +x /usr/local/bin/docker-compose

  echo "docker-compose 安裝完成。"
else
  echo "docker-compose 已安裝。"
fi