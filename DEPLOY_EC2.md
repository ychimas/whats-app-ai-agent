## Despliegue en AWS EC2 (Next.js + NextAuth Google + WhatsApp Baileys)

Guía paso a paso para clonar este proyecto en una instancia EC2 y dejarlo corriendo en segundo plano (producción), con login por Google (NextAuth) y con persistencia de sesión de WhatsApp.

---

### 0) Prerrequisitos (en AWS)

**EC2**
- AMI recomendada: Ubuntu Server LTS (22.04 o 24.04).
- Tipo: mínimo t3.small (recomendado) o t3.micro (puede quedarse corto).
- Almacenamiento: mínimo 20 GB.

**Security Group (Inbound)**
- TCP 22 desde tu IP (SSH).
- TCP 80 desde 0.0.0.0/0 (HTTP).
- TCP 443 desde 0.0.0.0/0 (HTTPS).

**Dominio**
- Un dominio apuntando a la IP pública de la instancia (A record).

---

### 1) Conéctate por SSH

```bash
ssh -i /ruta/tu-key.pem ubuntu@TU_IP_PUBLICA
```

---

### 2) Instala dependencias base (Ubuntu)

```bash
sudo apt-get update
sudo apt-get install -y git nginx curl ca-certificates
```

---

### 3) Instala Node.js (recomendado: NVM)

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts
node -v
npm -v
```

---

### 4) Clona el proyecto y prepara build de producción

```bash
cd /var/www
sudo mkdir -p whats-app-ai-agent
sudo chown -R ubuntu:ubuntu whats-app-ai-agent

git clone TU_URL_GIT whats-app-ai-agent
cd whats-app-ai-agent

npm install
npm run build
```

---

### 5) Variables de entorno (Google login + NextAuth)

Este proyecto usa NextAuth con Google. Debes configurar estas variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Crea el archivo `.env`**

```bash
cd /var/www/whats-app-ai-agent
nano .env
```

Ejemplo:

```env
NEXTAUTH_URL=https://TU_DOMINIO.com
NEXTAUTH_SECRET=una_cadena_larga_aleatoria

GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
```

**Genera un `NEXTAUTH_SECRET` fuerte**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 6) Configura Google OAuth (paso crítico)

En Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:

**Authorized JavaScript origins**
- `https://TU_DOMINIO.com`

**Authorized redirect URIs**
- `https://TU_DOMINIO.com/api/auth/callback/google`

Importante:
- Si usas HTTP (solo para pruebas), sería `http://TU_DOMINIO.com/...`, pero lo recomendado es HTTPS con 443.

---

### 7) Persistencia de WhatsApp y datos del agente (paso crítico)

Este proyecto guarda datos en el directorio de ejecución (`process.cwd()`), por ejemplo:
- `auth_info_baileys/` (sesión de WhatsApp escaneada por QR)
- `agent_config.json` (API key y contexto del agente)
- `chats_data.json` (historial de chats)

**Claves:**
- Esos archivos deben ser **escribibles** por el usuario que ejecuta el proceso.
- No borres `auth_info_baileys/` si quieres evitar re-escanear QR.
- Si vuelves a desplegar (git pull / reclonar), conserva esos archivos/directorios.

Recomendación rápida de permisos (si ejecutas el servicio con usuario `ubuntu`):

```bash
cd /var/www/whats-app-ai-agent
sudo chown -R ubuntu:ubuntu .
```

---

### 8) Dejar corriendo en segundo plano con systemd (recomendado)

#### 8.1 Crear el servicio

```bash
sudo nano /etc/systemd/system/whats-app-ai-agent.service
```

Contenido:

```ini
[Unit]
Description=WhatsApp AI Agent (Next.js)
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/whats-app-ai-agent
Environment=NODE_ENV=production
EnvironmentFile=/var/www/whats-app-ai-agent/.env
ExecStart=/bin/bash -lc "cd /var/www/whats-app-ai-agent && npm start"
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Notas:
- Con `bash -lc` se carga el entorno del usuario (incluyendo NVM) y encuentra `npm` correctamente.
- Si prefieres evitar `bash -lc`, puedes usar una ruta fija a `npm` (la obtienes con `which npm`) y reemplazar el `ExecStart`.

#### 8.2 Activar y arrancar

```bash
sudo systemctl daemon-reload
sudo systemctl enable whats-app-ai-agent
sudo systemctl start whats-app-ai-agent
sudo systemctl status whats-app-ai-agent --no-pager
```

Ver logs:

```bash
journalctl -u whats-app-ai-agent -n 200 --no-pager
journalctl -u whats-app-ai-agent -f
```

---

### 9) Nginx como reverse proxy (puerto 80/443 → 3000)

#### 9.1 Crear config de Nginx

```bash
sudo nano /etc/nginx/sites-available/whats-app-ai-agent
```

Contenido (HTTP):

```nginx
server {
  listen 80;
  server_name TU_DOMINIO.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

Activar sitio:

```bash
sudo ln -sf /etc/nginx/sites-available/whats-app-ai-agent /etc/nginx/sites-enabled/whats-app-ai-agent
sudo nginx -t
sudo systemctl reload nginx
```

#### 9.2 (Recomendado) HTTPS con Certbot

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d TU_DOMINIO.com
```

Luego confirma que:
- `NEXTAUTH_URL` sea `https://TU_DOMINIO.com`

---

### 10) Primer arranque: login y WhatsApp QR

1. Abre: `https://TU_DOMINIO.com`
2. Inicia sesión con Google.
3. Ve a “Configurar WhatsApp” y conecta WhatsApp (escanea QR).
4. Configura el proveedor IA y el contexto.

Desde ese momento:
- La sesión de WhatsApp queda guardada en `auth_info_baileys/`.
- El contexto y API key quedan en `agent_config.json`.
- El historial queda en `chats_data.json`.

---

### 11) Actualizar el proyecto sin tumbarlo (flujo recomendado)

```bash
cd /var/www/whats-app-ai-agent
git pull
npm install
npm run build
sudo systemctl restart whats-app-ai-agent
```

Importante:
- No borres `auth_info_baileys/`, `agent_config.json`, `chats_data.json`.

---

### 12) Troubleshooting rápido

**A) Google login redirige mal**
- Revisa `NEXTAUTH_URL` (debe ser tu dominio, no localhost).
- Revisa los Redirect URIs en Google Console.

**B) La app no levanta**
- `sudo systemctl status whats-app-ai-agent --no-pager`
- `journalctl -u whats-app-ai-agent -n 200 --no-pager`
- Confirma que `npm start` funciona en producción (requiere `npm run build` antes).

**C) Nginx 502**
- Confirma que Next está corriendo en 127.0.0.1:3000.
- `curl -I http://127.0.0.1:3000`

**D) WhatsApp pide QR otra vez**
- Revisa que `auth_info_baileys/` exista y tenga permisos.
- Asegura que el servicio use el mismo `WorkingDirectory`.
