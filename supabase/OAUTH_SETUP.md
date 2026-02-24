# OAuth Provider Setup — NudiNadi

## 1. Google OAuth

### Google Cloud Console
1. Geh zu https://console.cloud.google.com/
2. Erstelle ein neues Projekt (oder nutze ein existierendes)
3. Geh zu **APIs & Services** → **Credentials**
4. Klick **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `NudiNadi`
7. **Authorized redirect URIs** — füge hinzu:
   ```
   https://ivdxafuxpigleqmyhpcd.supabase.co/auth/v1/callback
   ```
8. Kopiere **Client ID** und **Client Secret**

### Supabase Dashboard
1. Geh zu https://supabase.com/dashboard/project/ivdxafuxpigleqmyhpcd/auth/providers
2. Finde **Google** in der Provider-Liste
3. Aktiviere den Toggle
4. Füge **Client ID** und **Client Secret** ein
5. Speichern

---

## 2. Facebook OAuth

### Meta Developer Portal
1. Geh zu https://developers.facebook.com/
2. Erstelle eine neue App → **Consumer** Typ
3. Geh zu **Facebook Login** → **Settings**
4. **Valid OAuth Redirect URIs** — füge hinzu:
   ```
   https://ivdxafuxpigleqmyhpcd.supabase.co/auth/v1/callback
   ```
5. Geh zu **Settings** → **Basic**
6. Kopiere **App ID** und **App Secret**

### Supabase Dashboard
1. Geh zu https://supabase.com/dashboard/project/ivdxafuxpigleqmyhpcd/auth/providers
2. Finde **Facebook** in der Provider-Liste
3. Aktiviere den Toggle
4. Füge **App ID** (als Client ID) und **App Secret** (als Client Secret) ein
5. Speichern

---

## 3. Redirect URLs (wichtig!)

Supabase OAuth Callback URL (gleich für alle Provider):
```
https://ivdxafuxpigleqmyhpcd.supabase.co/auth/v1/callback
```

Die App leitet nach Auth weiter zu:
```
https://deine-domain.com/auth/callback
```

### Für lokale Entwicklung
Supabase Redirect URL bleibt gleich. In **Supabase Dashboard** → **Auth** → **URL Configuration**:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

### Für Produktion
- Site URL: `https://nudinadi.ba`
- Redirect URLs: `https://nudinadi.ba/auth/callback`
