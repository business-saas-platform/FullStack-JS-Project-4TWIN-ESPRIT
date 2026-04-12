# Business AI Service Pro

Service AI **séparé** pour ton projet SaaS, sans modification de ton backend NestJS.

## Ce que fait ce projet
- lit directement la **même base PostgreSQL** que ton backend
- entraîne des modèles AI/ML à partir de **tes données applicatives** + **Online Retail II**
- génère des **insights** dans la table `ai_insights`
- expose une API FastAPI pour le front
- envoie des **notifications AI** sans utiliser ton module `communication`
- génère des **images business pro** (report cards / KPI cards / alert cards)

## Modèles inclus
1. **Late payment risk** pour les factures
2. **Expense anomaly detection**
3. **Client segmentation**
4. **Cashflow forecast**
5. **Recommendation engine** basé sur règles + scores

## Aucune modification obligatoire dans ton backend
Le service se connecte à PostgreSQL et utilise les tables existantes :
- `businesses`
- `clients`
- `invoices`
- `invoice_items`
- `expenses`
- `ai_insights`

## Démarrage rapide
```bash
cd AI-Service-Pro
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# ou .venv\Scripts\activate sous Windows
pip install -r requirements.txt
cp .env.example .env
```

### Mettre le dataset
Le projet attend le fichier ici:
```bash
AI-Service-Pro/data/online_retail_II.xlsx
```

### Lancer l'API
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

### Endpoints utiles
- `GET /api/v1/health`
- `POST /api/v1/train/all`
- `POST /api/v1/businesses/{business_id}/run`
- `GET /api/v1/businesses/{business_id}/summary`
- `GET /api/v1/businesses/{business_id}/notifications`
- `POST /api/v1/businesses/{business_id}/images/report-card`

## Intégration front simple
Exemple:
```ts
const AI_API = import.meta.env.VITE_AI_API_URL || 'http://localhost:8010/api/v1';

export async function fetchAISummary(businessId: string) {
  const res = await fetch(`${AI_API}/businesses/${businessId}/summary`);
  if (!res.ok) throw new Error('AI summary fetch failed');
  return res.json();
}
```

## Notification sans toucher `communication`
Le service ne touche pas à ton module websocket / messages.
À la place il fournit:
- notifications API via `GET /businesses/{id}/notifications`
- stockage JSON local dans `output/reports/notifications_{businessId}.json`
- email optionnel via SMTP
- insertion d'insights dans `ai_insights`

## Structure
```bash
app/
  api/
  core/
  db/
  models/
  schemas/
  services/
  utils/
scripts/
data/
output/
```

## Note tunisienne
Hedha service pro janb projetek. Ma ynajjemch ykasserlek el backend, parce que ma ybaddel chay men Nest. Yekhdem wa7dou, y9ra data, ydir AI, yekteb insights, w ykhallik tzid valeur 9weya lel projet.


## Installation Windows (CMD)
```cmd
cd AI-Service-Pro-v2
py -3.13 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip setuptools wheel
copy .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```

## Installation Windows (PowerShell)
```powershell
cd AI-Service-Pro-v2
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
Copy-Item .env.example .env
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8010
```


## Note Windows importante
Ce package utilise maintenant `pg8000` (pur Python) au lieu de `psycopg2-binary`, pour éviter les erreurs Visual C++ Build Tools sur Windows.


## Fixes inclus dans v4
- Compatibilité Windows avec `pg8000`
- CORS corrigé pour `localhost:5173`
- Routes `/api/v1/*` corrigées
- Mapping PostgreSQL UUID corrigé
- Mapping des enums PostgreSQL `ai_insights_*_enum` corrigé
