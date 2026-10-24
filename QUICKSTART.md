# Quickstart (Windows / macOS / Linux)

## 1. Open the project

Extract the ZIP into a normal development folder, then open that folder in VS Code.

## 2. Configure local environment

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

## 3. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Run checks before committing

```bash
npm run typecheck
npm run lint
npm run build
```

If an API request fails, check internet access and the configured edition IDs in `.env.local`. Do not put any private key in this file if the project becomes public; `.env.local` is excluded from Git.

## Current status

This starter's TypeScript/TSX files passed syntax transpilation in the build-authoring environment, but the package dependencies could not be installed and a full typecheck/build has not been run here. Run the commands above locally and fix any dependency or type issues before deployment.
