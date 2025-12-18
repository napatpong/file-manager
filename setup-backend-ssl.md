# Setup Backend SSL for Large File Uploads

## ปัญหา
- Cloudflare Worker มี timeout 30 วินาที
- ไฟล์ใหญ่ upload ไม่ทัน
- Frontend บน HTTPS ไม่สามารถเรียก HTTP backend ได้ตรง (Mixed Content blocked)

## วิธีแก้ที่ดีที่สุด: ตั้ง Nginx Reverse Proxy with SSL

### 1. Install Nginx (ถ้ายังไม่มี)
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. สร้าง Nginx Config สำหรับ Backend
```bash
sudo nano /etc/nginx/sites-available/driveback
```

เพิ่มเนื้อหา:
```nginx
server {
    listen 80;
    server_name driveback.itc-group.co.th;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name driveback.itc-group.co.th;

    # SSL certificates (will be configured by certbot)
    ssl_certificate /etc/letsencrypt/live/driveback.itc-group.co.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/driveback.itc-group.co.th/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Large file upload settings
    client_max_body_size 10G;
    client_body_timeout 600s;
    client_header_timeout 600s;
    send_timeout 600s;
    proxy_read_timeout 600s;
    proxy_connect_timeout 600s;
    proxy_send_timeout 600s;

    # Proxy to Node.js backend
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
        proxy_buffering off;
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/driveback /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. ตั้งค่า SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d driveback.itc-group.co.th
```

### 5. Update DNS
ให้ `driveback.itc-group.co.th` ชี้ไปที่ IP ของ backend server

### 6. Update Frontend Config
แก้ `wrangler.toml` ให้ใช้ HTTPS:
```toml
vars = { API_URL = "https://driveback.itc-group.co.th" }
```
(ลบ :2087 เพราะ Nginx ใช้ port 443)

### 7. Redeploy
```bash
wrangler deploy --env production
```

## ทางเลือกอื่น (ถ้าไม่สามารถตั้ง SSL Backend ได้)

### Option A: Chunked Upload
- แบ่งไฟล์ออกเป็น chunks ขนาดเล็ก (เช่น 5MB)
- Upload ทีละ chunk ผ่าน Worker
- Backend รวม chunks เป็นไฟล์เดียว
- ซับซ้อนแต่ work around Worker timeout

### Option B: Cloudflare R2 Storage
- ใช้ Cloudflare R2 สำหรับเก็บไฟล์
- Frontend upload ตรงไป R2 (Presigned URL)
- Bypass Worker completely
- ต้องจ่ายค่าบริการ R2

### Option C: เพิ่ม Timeout Warning
- เพิ่ม warning ให้ user ทราบว่าไฟล์ใหญ่กว่า X MB อาจ upload ไม่สำเร็จ
- แนะนำให้ใช้ไฟล์เล็กกว่า หรือแบ่งไฟล์
