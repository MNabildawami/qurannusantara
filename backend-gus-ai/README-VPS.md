# Deploy backend Gus AI pada VPS Rumahweb (Ubuntu 24.04)

Backend ini terpisah dari Hermes dan hanya mendengarkan di 127.0.0.1:8010. Gunakan satu worker pada VPS 1 vCPU / RAM sekitar 2.3 GB. Jangan buka port 8010 ke internet.

## Prasyarat
- Hak SSH/sudo ke VPS.
- Domain atau subdomain yang kamu kendalikan, misalnya api.domain-kamu.com, dengan DNS A record ke IP publik VPS. Frontend Vercel wajib mengakses API lewat HTTPS; jangan gunakan URL HTTP dari halaman HTTPS.
- API key dari https://openrouter.ai/keys. API key disimpan di file .env pada VPS saja.

Model backend dikunci menjadi openrouter/free. Client tidak bisa mengirim ID model sendiri. Tetap periksa halaman penggunaan provider secara berkala, dan jangan pernah menaruh API key di frontend atau variabel NEXT_PUBLIC_*.

## 1. Upload file
Ekstrak paket utama di komputer. Upload folder backend-gus-ai ke VPS menggunakan WinSCP/SFTP, misalnya ke /tmp/backend-gus-ai. Folder ini terpisah dari instalasi Hermes.

## 2. Install Python environment
Jalankan melalui SSH:

~~~bash
sudo apt update
sudo apt install -y python3-venv python3-pip nginx
sudo useradd --system --create-home --home-dir /opt/qn-gus-ai --shell /usr/sbin/nologin qn-gus-ai
sudo mkdir -p /opt/qn-gus-ai
sudo cp -a /tmp/backend-gus-ai/. /opt/qn-gus-ai/
sudo chown -R qn-gus-ai:qn-gus-ai /opt/qn-gus-ai
sudo -u qn-gus-ai python3 -m venv /opt/qn-gus-ai/.venv
sudo -u qn-gus-ai /opt/qn-gus-ai/.venv/bin/pip install --upgrade pip
sudo -u qn-gus-ai /opt/qn-gus-ai/.venv/bin/pip install -r /opt/qn-gus-ai/requirements.txt
sudo cp /opt/qn-gus-ai/.env.example /opt/qn-gus-ai/.env
sudo nano /opt/qn-gus-ai/.env
~~~

Isi .env dengan nilai yang benar:

~~~dotenv
OPENROUTER_API_KEY=isi_key_openrouter_kamu
FRONTEND_ORIGINS=https://qurannusantara.vercel.app,http://localhost:3000
OPENROUTER_SITE_URL=https://qurannusantara.vercel.app
~~~

Jika domain produksi frontend berbeda dari qurannusantara.vercel.app, ganti nilai itu. Jangan membagikan isi .env. Setelah menyimpan:

~~~bash
sudo chown qn-gus-ai:qn-gus-ai /opt/qn-gus-ai/.env
sudo chmod 600 /opt/qn-gus-ai/.env
~~~

## 3. Jalankan service systemd
~~~bash
sudo cp /opt/qn-gus-ai/deploy/qn-gus-ai.service /etc/systemd/system/qn-gus-ai.service
sudo systemctl daemon-reload
sudo systemctl enable --now qn-gus-ai
sudo systemctl status qn-gus-ai --no-pager
curl http://127.0.0.1:8010/health
~~~
Hasil health diharapkan memuat status ok, service gus-ai-api, dan model_mode free-router. Endpoint ini tidak meminta model dan tidak menggunakan kuota AI.

## 4. Pasang Nginx dan HTTPS
Buat DNS A record untuk api.domain-kamu.com ke IP publik VPS. Lalu ubah server_name api.example.com di file deploy/nginx-gus-ai.conf menjadi domain kamu:

~~~bash
sudo nano /opt/qn-gus-ai/deploy/nginx-gus-ai.conf
sudo cp /opt/qn-gus-ai/deploy/nginx-gus-ai.conf /etc/nginx/sites-available/qn-gus-ai
sudo ln -s /etc/nginx/sites-available/qn-gus-ai /etc/nginx/sites-enabled/qn-gus-ai
sudo nginx -t
sudo systemctl reload nginx
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.domain-kamu.com
~~~

Ganti api.domain-kamu.com dengan domain yang benar-benar kamu miliki. Jangan aktifkan konfigurasi contoh sebelum mengganti hostname. Di firewall, cukup buka port 80/443; biarkan 8010 hanya pada loopback.

Uji:
~~~bash
curl https://api.domain-kamu.com/health
~~~

Log troubleshooting:
~~~bash
sudo journalctl -u qn-gus-ai -n 100 --no-pager
sudo systemctl restart qn-gus-ai
~~~

## 5. Hubungkan frontend Vercel
Buka Project Settings lalu Environment Variables di Vercel dan tambahkan:

~~~dotenv
NEXT_PUBLIC_GUS_AI_API_URL=https://api.domain-kamu.com
~~~

Nilai ini URL publik, bukan secret. Setelah disimpan, redeploy frontend. Jangan menambahkan OPENROUTER_API_KEY ke Vercel frontend. Backend membatasi input sampai 4.000 karakter per pesan, hanya menerima role user/assistant, memakai maksimal 12 pesan terakhir, dan memberi batas 12 permintaan per menit per IP per proses.

## Kontrak API
- GET /health — status layanan.
- POST /api/chat — body: {"messages":[{"role":"user","content":"Halo"}]}.
- Response: {"reply":"...","model":"...","mode":"mvp"}.

## Batas MVP
Tahap ini menghubungkan model bahasa gratis, belum menjalankan RAG atau knowledge base tafsir. Model tidak dijamin akurat; UI memperingatkan pengguna agar memeriksa jawaban. Tahap berikutnya akan menambahkan retrieval sumber ayat/tafsir yang benar-benar terverifikasi. Rate limit saat ini di memori untuk satu proses; untuk beberapa worker, gunakan Redis atau rate limit di reverse proxy.
