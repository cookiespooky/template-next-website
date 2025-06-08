#!/bin/bash

set -e

USERNAME="courseplatform"
REPO_URL="https://github.com/cookiespooky/template-next-website.git"
APP_DIR="/home/$USERNAME/course-shop-platform"
SESSION_NAME="deploy_session"

# === Установка пакетов ===
echo "[INFO] Установка пакетов..."
apt update && apt install -y \
  git \
  docker.io \
  docker-compose \
  ufw \
  fail2ban \
  tmux

# === Создание пользователя ===
if ! id "$USERNAME" &>/dev/null; then
  echo "[INFO] Создаю пользователя $USERNAME..."
  adduser --disabled-password --gecos "" $USERNAME
  usermod -aG sudo $USERNAME
  usermod -aG docker $USERNAME
else
  echo "[INFO] Пользователь $USERNAME уже существует"
fi

# === Запуск и включение Docker ===
echo "[INFO] Включаю и запускаю Docker..."
systemctl enable docker
systemctl start docker

# === Настройка фаервола ===
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# === Клонирование репозитория ===
echo "[INFO] Клонирую репозиторий в $APP_DIR..."
su - $USERNAME -c "git clone $REPO_URL $APP_DIR || true"

# === Запуск деплоя в tmux-сессии ===
echo "[INFO] Запуск деплоя в tmux-сессии '$SESSION_NAME'..."
su - $USERNAME -c "
  tmux new-session -d -s $SESSION_NAME '
    cd $APP_DIR && ./scripts/deploy.sh prod --force
  '
"

echo "[✅] Готово! Деплой запущен в tmux-сессии '$SESSION_NAME'."
echo "Чтобы подключиться: su - $USERNAME && tmux attach -t $SESSION_NAME"