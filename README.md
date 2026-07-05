# AI English Tutor

Tutor interactivo de inglés conversacional. Una app mobile (Expo/React Native) con backend en Express que usa Groq (LLaMA 3.3) para corregir y enseñar inglés a hispanohablantes a través de conversaciones naturales.

## Arquitectura

```
┌─────────────────────────────┐      ┌──────────────────────────────────┐
│         App (Expo)          │      │        Server (Express)          │
│                             │      │                                  │
│  ChatScreen                 │      │  POST /api/chat                  │
│  MessageBubble  ──HTTP──▶   │      │  POST /api/test                  │
│  correctionParser           │      │  GET  /health                    │
│  aiService                  │      │                                  │
│  promptBuilder              │      │  groq.ts ──▶ Groq API            │
│  storageService             │      │  openai.ts ──▶ OpenAI API        │
│                             │      │  anthropic.ts ──▶ Anthropic API  │
└─────────────────────────────┘      └──────────────────────────────────┘
```

- **App**: Expo + TypeScript + React Native. UI en modo oscuro, correcciones estructuradas en tarjetas nativas.
- **Server**: Express + TypeScript. Proxy seguro que nunca expone API keys al cliente. Soporta Groq, OpenAI y Anthropic.
- **AI**: La respuesta de la AI sigue un formato markdown estructurado (✅ Corrected Version, 📖 What You Got Wrong, 💡 Alternatives, 🎉 Keep Going!) que el `correctionParser` convierte en una estructura `Correction` renderizada nativamente por `MessageBubble`.

## Requisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Android SDK (para build APK local) o cuenta en Expo/EAS
- (Opcional) Railway CLI para deploy del backend

## Backend

```bash
cd server
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar al menos GROQ_API_KEY

# Desarrollo
npm run dev

# Tests
npm test
```

### Variables de Entorno

| Variable | Descripción |
|---|---|
| `GROQ_API_KEY` | API key de Groq (gratuita, llaves en groq.com) |
| `OPENAI_API_KEY` | API key de OpenAI (opcional) |
| `ANTHROPIC_API_KEY` | API key de Anthropic (opcional) |
| `PORT` | Puerto del servidor (default: 3001) |
| `CORS_ORIGIN` | Orígenes CORS permitidos (default: `*`) |
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting en ms (default: 60000) |
| `RATE_LIMIT_MAX` | Máximo de requests por ventana (default: 30) |

### Deploy a Railway

1. Conectar el repo a Railway
2. Setear `GROQ_API_KEY` como variable de entorno en Railway
3. El `railway.json` ya está configurado con el build y start command
4. Railway detecta automáticamente el `Procfile` y `railway.json`
5. El health check en `/health` permite a Railway monitorear el servicio

## App

```bash
cd app
npm install
npx expo start
```

### Configurar API Base URL

En `app/app.json` → `expo.extra.apiBaseUrl`:

| Entorno | URL |
|---|---|
| Emulador Android | `http://10.0.2.2:3001` |
| Dispositivo físico (misma red) | `http://<tu-ip-local>:3001` |
| Railway (producción) | `https://<tu-app>.railway.app` |

### Build APK

```bash
# Preview APK para pruebas
npx eas build -p android --profile preview

# Production APK
npx eas build -p android --profile production
```

## Stack

| Capa | Tecnología |
|---|---|
| App | Expo (React Native) + TypeScript |
| Navegación | `@react-navigation/native-stack` |
| UI Markdown | `react-native-markdown-display` |
| Backend | Express + TypeScript |
| AI Providers | Groq SDK / OpenAI SDK / Anthropic SDK |
| Testing | Jest + Supertest |
| Deploy | Railway (server) / EAS (app) |
