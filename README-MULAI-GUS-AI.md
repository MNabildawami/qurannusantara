# QuranNusantara — Gus AI MVP

Paket awal untuk mengaktifkan percakapan AI di halaman Gus AI dan widget pratinjau.

## Isi paket
- backend-gus-ai/: FastAPI, integrasi model gratis OpenRouter, file environment contoh, unit systemd, konfigurasi Nginx, dan panduan deploy VPS.
- src/lib/gus-ai-client.ts: klien browser untuk mengirim pesan ke backend.
- src/components/gus-ai-page.tsx: halaman chatbot penuh menggunakan API dan tetap menyimpan riwayat di LocalStorage.
- src/components/gus-ai-panel.tsx: widget pratinjau menggunakan API yang sama.
- file CSS dan komponen QuranNusantara yang diperbarui dari revisi sebelumnya.
- .env.example: nama environment variable publik untuk frontend (bukan kredensial).

## Penting sebelum mengirim pesan
Kamu harus mengunggah folder backend-gus-ai ke VPS, membuat API key OpenRouter, menjalankan service FastAPI, dan menyediakan alamat HTTPS. Panduan langkah-demi-langkah ada di backend-gus-ai/README-VPS.md.

Backend mematok model ke openrouter/free; model tidak bisa diatur oleh request browser. API key hanya boleh disimpan di file .env pada VPS. Jangan masukkan OPENROUTER_API_KEY ke Vercel atau variabel NEXT_PUBLIC_*.

## Hubungkan frontend
Setelah backend tersedia dengan HTTPS, buka Project Settings → Environment Variables di Vercel dan isi:
- Name: NEXT_PUBLIC_GUS_AI_API_URL
- Value: https://api.domain-kamu.com

Ganti contoh domain dengan subdomain yang benar-benar sudah kamu konfigurasi. Kemudian redeploy Vercel. Untuk pengujian frontend lokal, gunakan alamat backend yang bisa dijangkau oleh browser, bukan alamat loopback VPS.

## Tes setelah deploy
- GET https://api.domain-kamu.com/health
- POST https://api.domain-kamu.com/api/chat dengan JSON body:
  {"messages":[{"role":"user","content":"Halo, siapa kamu?"}]}

Respons chat berisi reply, model, dan mode.

## Batas tahap pertama
Ini baru menghubungkan model bahasa gratis. RAG, knowledge base ayat/tafsir terverifikasi, jawaban dengan sitasi, streaming, dan input suara belum disertakan di backend tahap pertama. System prompt meminta model tidak mengarang rujukan, tetapi tanpa RAG belum ada jaminan semua jawaban agama akurat. Tahap berikutnya adalah menambah pengambilan sumber tepercaya sebelum model menyusun jawaban.
