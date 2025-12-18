# Enable HTTPS with Self-Signed Certificate

Backend จะตรวจสอบว่ามี SSL certificate ใน `ssl/` ไหม ถ้ามีจะรัน HTTPS อัตโนมัติ

## วิธีสร้าง Self-Signed Certificate

### Windows (PowerShell)
```powershell
cd backend
.\generate-ssl.ps1
```

### Linux/Mac
```bash
cd backend
bash generate-ssl.sh
```

### Manual (ทุก OS ที่มี OpenSSL)
```bash
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/driveback.key \
  -out ssl/driveback.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=ITC/CN=driveback.itc-group.co.th"
```

## Restart Backend

```bash
pm2 restart file-manager-backend
```

## ตรวจสอบว่าใช้ HTTPS

เช็ค logs:
```bash
pm2 logs file-manager-backend
```

ควรเห็น:
```
🔒 HTTPS Server is running on port 2087
⚠️  Using self-signed certificate
```

## Test

```bash
curl -k https://driveback.itc-group.co.th:2087/api/health
```

## ปิด HTTPS (ใช้ HTTP)

ลบหรือย้าย certificate files:
```bash
mv ssl/driveback.key ssl/driveback.key.backup
mv ssl/driveback.crt ssl/driveback.crt.backup
pm2 restart file-manager-backend
```
