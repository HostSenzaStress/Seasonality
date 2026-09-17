# Guida rapida al deploy su GitHub + Vercel

## 📌 PRIMA DI TUTTO: file da NON pushare
Il file `.env` contenente la tua Google API key **è già escluso** dal `.gitignore`. Verifica sempre prima di committare che non compaia nella lista di file da pushare.

---

## 1️⃣ Push su GitHub

### A. Crea un nuovo repository su GitHub
1. Vai su https://github.com/new
2. Nome repository: `seasonality-hub` (o quello che preferisci)
3. Lascia **Public** o metti **Private** (funziona uguale con Vercel)
4. **NON** aggiungere README/gitignore/license (li abbiamo già)
5. Clicca **Create repository**

### B. Comandi da eseguire in locale
Apri il terminale nella cartella del progetto ed esegui questi comandi uno alla volta:

```bash
# inizializza git (se non già fatto)
git init

# imposta il branch principale
git branch -M main

# aggiungi tutti i file (il .env viene ignorato automaticamente)
git add .

# verifica che il .env NON sia negli staged files
git status | grep -i env
# Dovresti vedere solo .env.example, MAI .env da solo

# primo commit
git commit -m "feat: initial seasonality hub app"

# collega il repo remoto (sostituisci USERNAME e REPO)
git remote add origin https://github.com/USERNAME/seasonality-hub.git

# push
git push -u origin main
```

GitHub potrebbe chiederti di autenticarti con un **Personal Access Token** invece della password:
- https://github.com/settings/tokens
- "Generate new token (classic)" → scope `repo` → copia il token e usalo come password

---

## 2️⃣ Deploy su Vercel

### A. Deploy dal sito Vercel (più facile)
1. Vai su https://vercel.com/new
2. Login con GitHub
3. **Import** il tuo repository `seasonality-hub`
4. Nella pagina di configurazione, apri la sezione **"Environment Variables"** e aggiungi:

| Name | Value |
|---|---|
| `GOOGLE_SHEETS_API_KEY` | `AIzaSyAPZkDCo6dV6wANxusDgod8g7zI4Ztxdg4` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | `1LvilmqTT3bXKJYI1_uYZ-tR4vnytffLGAHHMi9I_kHM` |
| `GOOGLE_SHEETS_TAB_NAME` | `Diario Trade` |
| `GOOGLE_SHEETS_HEADER_ROW` | `3` |

5. Clicca **Deploy** → attendi ~1 minuto → fatto! ✅

Ti verrà dato un URL tipo `https://seasonality-hub-tuoNome.vercel.app`

### B. Deploy via CLI (alternativa)
```bash
npm i -g vercel
vercel login
vercel                    # primo deploy (preview)
vercel env add GOOGLE_SHEETS_API_KEY production
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID production
vercel env add GOOGLE_SHEETS_TAB_NAME production
vercel env add GOOGLE_SHEETS_HEADER_ROW production
vercel --prod             # deploy in produzione
```

---

## 3️⃣ Aggiornamenti futuri

Ogni volta che modifichi il codice:
```bash
git add .
git commit -m "descrizione modifica"
git push
```
Vercel fa il deploy automaticamente su ogni push su `main`. Zero configurazione aggiuntiva.

---

## 🚨 Se hai già pushato per errore il .env con la chiave dentro

1. **Revoca subito la chiave** su https://console.cloud.google.com/apis/credentials
2. Crea una nuova API key
3. Rimuovi il file dalla history di git:
```bash
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: remove .env from tracking"
git push
```
(Per una pulizia completa della history serve `git filter-repo` o `bfg`, ma la revoca della chiave è la cosa più importante.)
