# Setup Backend SSL for Large File Uploads

## ปัญหา
- Cloudflare Worker มี timeout 30 วินาที
- ไฟล์ใหญ่ upload ไม่ทัน
- Frontend บน HTTPS ไม่สามารถเรียก HTTP backend ได้ตรง (Mixed Content blocked)
- **Self-signed certificates จะถูก reject โดย Cloudflare Worker**

## วิธีแก้: ใช้ Let's Encrypt Certificate (ฟรี + Auto-renew)

### ทำไมต้องใช้ Let's Encrypt?
- ✅ Certificate ที่ถูกต้องตามมาตรฐาน (trusted by browsers & Cloudflare)
- ✅ ฟรี 100%
- ✅ Auto-renew ทุก 90 วัน
- ❌ Self-signed cert จะถูก reject โดย Cloudflare Worker

### 1. Install Certbot (ถ้ายังไม่มี)
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. หยุด Nginx ชั่วคราว (ถ้ามี)
```bash
sudo systemctl stop nginx
```

### 3. ขอ Certificate จาก Let's Encrypt
```bash
sudo certbot certonly --standalone -d driveback.itc-group.co.th
```

ตอบคำถาม:
- Email: ใส่ email ของคุณ
- Terms: กด Y
- Share email: กด N หรือ Y ตามใจ

Certificate จะถูกสร้างที่:
- `/etc/letsencrypt/live/driveback.itc-group.co.th/fullchain.pem`
- `/etc/letsencrypt/live/driveback.itc-group.co.th/privkey.pem`

### 4. สร้าง/แก้ไข Nginx Config
```bash
sudo nano /etc/nginx/sites-available/driveback
```

เนื้อหา:
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

    # Let's Encrypt SSL certificates
    ssl_certificate /etc/letsencrypt/live/driveback.itc-group.co.th/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/driveback.itc-group.co.th/privkey.pem;

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
        proxy_request_buffering off;
    }
}
```

### 5. Enable Site & Restart Nginx
```bash
sudo ln -sf /etc/nginx/sites-available/driveback /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 6. Setup Auto-Renewal
Certbot จะ auto-renew ให้อัตโนมัติ ตรวจสอบ:
```bash
sudo certbot renew --dry-run
```

### 7. Update Cloudflare Worker Config
แก้ `wrangler.toml`:
```toml
vars = { API_URL = "https://driveback.itc-group.co.th" }
```
(ลบ :2087 เพราะ Nginx ใช้ port 443)

### 8. Redeploy Worker
```bash
cd d:\app\download\file-manager-app
wrangler deploy --env production
```

### 9. Update Frontend Build & Upload to KV
```powershell
cd frontend
npm run build
cd ..

# Delete old files from KV
wrangler kv key delete "/assets/index-5k8KOnEg.js" --binding drive_manager --env production --remote

# Upload new build
$files = @(
  @{key="/index.html"; path="frontend\dist\index.html"},
  @{key="/assets/index-XXXXXXXX.js"; path="frontend\dist\assets\index-XXXXXXXX.js"}
)
foreach ($file in $files) { 
  wrangler kv key put $file.key --binding drive_manager --path $file.path --env production --remote 2>&1 | Out-Null
  Write-Host "✓ Uploaded $($file.key)" 
}
```

### 10. Test
1. เข้า https://driveback.itc-group.co.th ตรง (ต้องเห็น API response)
2. เข้า https://drive.itc-group.co.th (frontend)
3. ลอง upload ไฟล์ใหญ่ > 100MB

---

## ทางเลือกอื่น: Cloudflare Origin CA Certificate

ถ้า Let's Encrypt ใช้ไม่ได้ ใช้ Cloudflare Origin CA:

### 1. สร้าง Origin Certificate
1. เข้า Cloudflare Dashboard
2. เลือก domain: itc-group.co.th
3. ไป SSL/TLS → Origin Server
4. คลิก "Create Certificate"
5. เลือก:
   - Hostnames: `driveback.itc-group.co.th`
   - Certificate Validity: 15 years
6. คลิก Create
7. Copy ทั้ง **Origin Certificate** และ **Private Key**

### 2. บันทึก Certificate บน Server
```bash
sudo mkdir -p /etc/ssl/cloudflare
sudo nano /etc/ssl/cloudflare/driveback.crt
# Paste Origin Certificate

sudo nano /etc/ssl/cloudflare/driveback.key
# Paste Private Key

sudo chmod 600 /etc/ssl/cloudflare/driveback.key
```

### 3. แก้ Nginx Config
```nginx
ssl_certificate /etc/ssl/cloudflare/driveback.crt;
ssl_certificate_key /etc/ssl/cloudflare/driveback.key;
```

### 4. Restart Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Troubleshooting

### ตรวจสอบ SSL Certificate
```bash
openssl s_client -connect driveback.itc-group.co.th:443 -servername driveback.itc-group.co.th
```

### ดู Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Test Upload ผ่าน CURL
```bash
curl -X POST https://driveback.itc-group.co.th/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@largefile.zip" \
  -F "description=Test large file"
```
