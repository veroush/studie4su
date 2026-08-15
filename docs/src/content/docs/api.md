# API Documentatie

Welkom bij de API-documentatie van Studie4SU. De frontend communiceert met onze backend via RESTful API endpoints. Alle data wordt verzonden en ontvangen in JSON-formaat.

## Base URL
Productie: `https://api.studie4su.sr/v1` (of jullie eigen backend link)
Lokaal: `http://localhost:3000/api`

---

## Endpoints

### 1. Haal alle opleidingen op
Haalt een lijst op van alle beschikbare scholen en opleidingen.

* **URL:** `/opleidingen`
* **Method:** `GET`
* **Authenticatie vereist:** Nee

**Succesvolle Response (200 OK):**
```json
[
  {
    "id": 1,
    "naam": "Informatica",
    "school": "Unasat",
    "niveau": "HBO"
  }
]