#!/bin/bash

set -e

# === Настройки ===
USERNAME="courseplatform"
REPO_URL="https://github.com/cookiespooky/template-next-website.git"  # 🔁 ЗАМЕНИ НА СВОЙ
APP_DIR="/home/$USERNAME/app"

# === Создание пользователя ===
if ! id "$USERNAME" &>/dev/null; then
  echo "[INFO] Создаю пользователя $USERNAME..."
  adduser --disabled-password --gecos "" $USERNAME
  usermod -aG sudo $USERNAME
  usermod -aG docker $USERNAME
else
  echo "[INFO] Пользователь $USERNAME уже существует"
fi

# === Установка пакетов ===
echo "[INFO] Установка пакетов..."
apt update && apt install -y \
  git \
  docker.io \
  docker-compose \
  ufw \
  fail2ban

# === Запуск и включение Docker ===
systemctl enable docker
systemctl start docker

# === Настройка фаервола ===
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# === Клонирование репозитория ===
echo "[INFO] Клонирую репозиторий в $APP_DIR..."
su - $USERNAME -c "git clone $REPO_URL $APP_DIR"

# === Деплой приложения ===
echo "[INFO] Запуск деплоя..."
su - $USERNAME -c "cd $APP_DIR && ./scripts/deploy.sh prod --force"

echo "[✅] Готово! Приложение развернуто."
