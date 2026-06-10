# Fitness FaaS Frontend

React/Vite spletni vmesnik za `fitness-membership-serverless` funkcije.

## Zagon

Najprej v korenu projekta zaženite backend:

```bash
npm run offline
```

Nato v drugem terminalu:

```bash
npm --prefix frontend install
npm run frontend
```

Odprite `http://localhost:5173`.

Testna prijava:

```text
admin@fitness.local
secret
```

Frontend pridobi token prek `POST /auth/login`, ga shrani v `localStorage` in ga pri zaščitenih API klicih pošlje kot `Authorization: Bearer TOKEN`.
