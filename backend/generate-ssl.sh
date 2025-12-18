# Generate self-signed certificate for backend
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/driveback.key \
  -out ssl/driveback.crt \
  -subj "/C=TH/ST=Bangkok/L=Bangkok/O=ITC/CN=driveback.itc-group.co.th"

echo "SSL certificate generated in backend/ssl/"
