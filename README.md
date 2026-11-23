# Rumisync

A dashboard for monitoring the health and nutrition of dairy cattle. An ESP32 reads body temperature, chewing sound and a BLE tag; a small Node service receives the data over MQTT and stores it in Supabase; a React app shows it.

[Bahasa Indonesia](README.id.md)

## What it does

- **Dashboard** with live readings per animal.
- **Medical monitoring** with a health score (GHSI) computed from the health code in `Panduan/kode kesehatan.txt`.
- **Eco nutrition:** feed formulation based on `Panduan/panduan skema input pakan.md`, a breed-specific methane (CH4) baseline, multi-feed selection and an AI feed optimizer.
- **System control:** the position of the camera and scanner on the active rail, rail configuration (cattle capacity per rail), signal strength (RSSI) and a live system log with anomaly notices.

## Tech stack

React, Vite, Tailwind CSS, Radix UI, Supabase, MQTT, Node.js (`mqtt-backend/`), Capacitor (`capacitor.config.json`). Deployed with GitHub Actions and Vercel; the MQTT service has a `railway.toml`.

## Getting started

```bash
npm install
cp .env.example .env     # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

MQTT service:

```bash
cd mqtt-backend
npm install
npm start                # needs MQTT_BROKER_URL, MQTT_USERNAME, MQTT_PASSWORD, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

The service role key belongs on the server only. Create the tables with `Panduan/supabase_schema.sql`.

## Project structure

```
src/app/        routes: dashboard, medical, eco-nutrition, system-control
mqtt-backend/   MQTT subscriber that writes to Supabase
Panduan/        integration guides, SQL schema, ESP32 firmware, health code and feed rules
```

Architecture: sensors, ESP32, MQTT (or HTTP), backend, Supabase, web app. See `Panduan/PANDUAN_INTEGRASI.md` and `Panduan/MQTT_Testing_Guide.md`.
