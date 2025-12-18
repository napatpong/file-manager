# Generate self-signed certificate for backend (Windows)
$certPath = "..\ssl"
if (-not (Test-Path $certPath)) {
    New-Item -ItemType Directory -Path $certPath
}

# Generate certificate using OpenSSL (requires OpenSSL installed)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout "$certPath\driveback.key" `
  -out "$certPath\driveback.crt" `
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=ITC/CN=driveback.itc-group.co.th"

Write-Host "✓ SSL certificate generated in ssl\" -ForegroundColor Green
