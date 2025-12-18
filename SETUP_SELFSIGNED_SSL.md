# Setup Self-Signed SSL Certificate for Backend

## Architecture
- Frontend (HTTPS) → Cloudflare Worker → Backend HTTP (ภายใน) → Nginx (HTTPS self-signed)
- Backend Node.js ทำงานบน HTTP port 2087 (localhost)
- Nginx รับ HTTPS port 443/2087 forward ไป Node.js

## 1. สร้าง Self-Signed Certificate

```bash
# สร้าง directory สำหรับเก็บ certificate
sudo mkdir -p /etc/ssl/private

# สร้าง self-signed certificate (valid 365 วัน)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/driveback.key \
  -out /etc/ssl/certs/driveback.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=ITC/CN=driveback.itc-group.co.th"

# ตั้งสิทธิ์
sudo chmod 600 /etc/ssl/private/driveback.key
sudo chmod 644 /etc/ssl/certs/driveback.crt
```

## 2. Install และ Config Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

สร้าง Nginx config:
```bash
sudo nano /etc/nginx/sites-available/driveback
```

เนื้อหา:
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    listen 2087;
    server_name driveback.itc-group.co.th;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen 2087 ssl http2;
    server_name driveback.itc-group.co.th;

    # Self-signed SSL certificate
    ssl_certificate /etc/ssl/certs/driveback.crt;
    ssl_certificate_key /etc/ssl/private/driveback.key;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Large file upload settings
    client_max_body_size 10G;
    client_body_timeout 3600s;
    client_header_timeout 3600s;
    send_timeout 3600s;
    proxy_read_timeout 3600s;
    proxy_connect_timeout 3600s;
    proxy_send_timeout 3600s;

    # Disable request buffering for streaming uploads
    proxy_request_buffering off;
    proxy_buffering off;

    # Proxy to Node.js backend (HTTP localhost)
    location / {
        proxy_pass http://127.0.0.1:2087;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 3. Enable Nginx Site

```bash
# Enable site
sudo ln -sf /etc/nginx/sites-available/driveback /etc/nginx/sites-enabled/

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 4. แก้ไข Backend Server.js (ถ้ารันบน port 2087 อยู่แล้ว)

Backend ควรรันบน `localhost:2087` เท่านั้น (ไม่ต้อง bind 0.0.0.0):

```javascript
// backend/server.js
const PORT = process.env.PORT || 2087;

const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
});
```

## 5. Restart Backend

```bash
pm2 restart file-manager-backend
pm2 save
```

## 6. ตรวจสอบว่าทำงาน

```bash
# Test Nginx
curl -k https://driveback.itc-group.co.th:2087/api/health

# ดู logs
sudo tail -f /var/log/nginx/error.log
pm2 logs file-manager-backend
```

## 7. **สำคัญ:** Cloudflare Worker จะ Reject Self-Signed Cert

เนื่องจาก Cloudflare Worker ไม่รองรับ self-signed certificate คุณมี 2 ทางเลือก:

### ทางเลือก A: ใช้ HTTP สำหรับ Worker → Backend (แนะนำ)
- Worker → HTTP ไปที่ backend port 2087
- ผู้ใช้เข้าผ่าน HTTPS frontend เท่านั้น
- Self-signed cert ใช้สำหรับเข้า backend โดยตรง (admin/development)

`wrangler.toml`:
```toml
vars = { API_URL = "http://driveback.itc-group.co.th:2087" }
```

### ทางเลือก B: Allow Insecure SSL (ไม่แนะนำ - ต้อง custom Worker)
Cloudflare Workers ไม่มี option `rejectUnauthorized: false` แบบ Node.js ดังนั้นไม่สามารถใช้ self-signed cert กับ Worker ได้

## 8. การใช้งาน

### สำหรับ End Users:
- เข้าผ่าน: https://drive.itc-group.co.th (HTTPS secure ผ่าน Cloudflare)
- Upload limit: 100MB (Worker timeout)

### สำหรับ Admins/Direct Access:
- เข้าผ่าน: https://driveback.itc-group.co.th:2087 (HTTPS self-signed)
- Browser จะเตือน "Not Secure" - คลิก Advanced → Proceed
- Upload ไฟล์ใหญ่ได้ไม่จำกัด (ไม่ผ่าน Worker)

## 9. Port Forwarding (ถ้าใช้)

ถ้า backend อยู่หลัง NAT/firewall:
```bash
# On router/firewall
Port Forward: 2087 (external) → 2087 (internal backend IP)
```

## สรุป

**Configuration สุดท้าย:**
- Backend: HTTP `127.0.0.1:2087` (Node.js)
- Nginx: HTTPS `driveback.itc-group.co.th:2087` (self-signed) → proxy ไป `127.0.0.1:2087`
- Worker: HTTP → `http://driveback.itc-group.co.th:2087` (bypass SSL)
- Frontend: HTTPS `drive.itc-group.co.th` (Cloudflare)

**ข้อดี:**
- ✅ Backend มี HTTPS (self-signed) สำหรับ direct access
- ✅ Frontend ยัง secure ผ่าน Cloudflare
- ✅ ไม่ต้องซื้อ SSL certificate

**ข้อเสีย:**
- ❌ Worker → Backend ยังเป็น HTTP (ไม่ encrypted)
- ❌ Upload ผ่าน frontend จำกัด 100MB
- ❌ Browser เตือน "Not Secure" เมื่อเข้า backend โดยตรง
