ImmoFacile - CRM Immobilier 

1) Prérequis (Windows)
- Python 3.10+ (téléchargez depuis le site officiel). Pendant l’installation, cochez "Add Python to PATH".
- Node.js 18+ (inclut npm).
- MySQL 8.0 (Server + Workbench). Démarrez le service MySQL (Services Windows).

Vérifications rapides dans PowerShell:
```
python --version
pip --version
node -v
npm -v
mysql --version
```

2) Configuration MySQL
- Ouvrez PowerShell, connectez-vous à MySQL avec un compte admin (ex. root):
```
mysql -u root -p
```
- Créez la base et l’utilisateur dédiés (ajustez le mot de passe si besoin):
```sql
CREATE DATABASE immo_facile CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'immo_user'@'localhost' IDENTIFIED BY 'MotDePasseTrèsSûr!';
GRANT ALL PRIVILEGES ON immo_facile.* TO 'immo_user'@'localhost';
FLUSH PRIVILEGES;
```

3) Backend (Django) - installation
- Ouvrez PowerShell dans `Backend\crmB` 
```
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```
- Créez le fichier `.env` dans `Backend\crmB` avec le contenu suivant (MySQL par défaut):
```
DEBUG=true
SECRET_KEY=remplacez-par-une-clé-secrète-forte
ALLOWED_HOSTS=127.0.0.1,localhost
DATABASE_URL=mysql://immo_user:MotDePasseTrèsSûr!@localhost:3306/immo_facile?charset=utf8mb4

# Email ( pour reset mot de passe)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
DEFAULT_FROM_EMAIL=
```
- Initialisez la base:
```
python manage.py migrate
```
- Lancez le serveur API:
```
python manage.py runserver 0.0.0.0:8000
```
API disponible: http://localhost:8000

4) Frontend (React) - installation
- Ouvrez un deuxième PowerShell dans `Frontend`:
- Le frontend appelle l'API du backend. Ajoutez un fichier `.env` à la racine de `Frontend`:

```
VITE_API_BASE_URL=http://localhost:8000
```
```
npm install
npm run dev
```
UI disponible: http://localhost:5173

5) Authentification (JWT) et création d’utilisateurs (app `Utilisateur`)
- Le projet utilise un user personnalisé: `AUTH_USER_MODEL = 'Utilisateur.Utilisateur'` (voir `Backend/crmB/crmB/settings.py`).
- La création d’utilisateur se fait via `RegistrerView` (fichier `Backend/crmB/Utilisateur/views.py`). Cette vue:
  - exige un utilisateur authentifié (permission `IsAuthenticated`)
  - utilise `RegistrerSerializer` qui appelle `Utilisateur.objects.create_user(...)`
  - ajoute les villes associées en créant des lignes `Utilisateur_ville`

Étapes:
1) Obtenir un token JWT avec le superuser créé:
```
curl -X POST http://localhost:8000/api/token/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@exemple.com\",\"password\":\"motdepasse\"}"
```
Réponse attendue: `{ "access": "<TOKEN>", "refresh": "..." }`

2) Créer un utilisateur (protégé par JWT):
```
curl -X POST http://localhost:8000/utilisateur/register/ ^
  -H "Authorization: Bearer <TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{
    \"nom\":\"Doe\",
    \"prenom\":\"Jane\",
    \"email\":\"jane.doe@example.com\",
    \"password\":\"MotDePasseSûr!\",
    \"telephone\":212345678,
    \"role\":\"commercial\",
    \"villeChoisie\":[\"Casablanca\",\"Rabat\"]
  }"
```
- Le mot de passe est hashé côté serveur (`set_password`).
- Les villes de `villeChoisie` sont enregistrées dans `Utilisateur_ville`.


