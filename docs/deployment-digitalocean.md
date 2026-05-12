# DigitalOcean VPS Deployment

Assume the domain is:

```txt
labexplainer.yourdomain.com
```

## 1. Prepare Server

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git nginx ufw ca-certificates curl
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

## 2. Install Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 3. Clone and Run

```bash
mkdir -p ~/apps
cd ~/apps
git clone https://github.com/YOUR_USERNAME/lab-results-explainer.git
cd lab-results-explainer
cp .env.example apps/api/.env
nano apps/api/.env

docker compose up -d --build
```

## 4. Nginx Reverse Proxy

Create:

```bash
sudo nano /etc/nginx/sites-available/labexplainer
```

Paste:

```nginx
server {
    listen 80;
    server_name labexplainer.yourdomain.com;

    client_max_body_size 10M;

    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/labexplainer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL

```bash
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d labexplainer.yourdomain.com
sudo certbot renew --dry-run
```
