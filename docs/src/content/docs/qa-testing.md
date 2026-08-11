---
title: QA Testing & Bug Reporting
description: Standardized procedures for testing frontend flows and API endpoints.
---

## QA Testing Checklist

Hier is de standaard checklist die voor elke deployment afgevinkt moet worden:

### API Endpoint Tests (via REST Client)
- [ ] Test `GET /schools` (Lijst met scholen laadt)
- [ ] Test `GET /programs` (Lijst met opleidingen laadt)
- [ ] Test `GET /search` (Zoek/filter parameters werken correct)
- [ ] Test `GET /users` (Admin kan gebruikers ophalen)

### Frontend & UI/UX Tests
- [ ] Controleer of de homepagina responsief is (Desktop & Mobiel)
- [ ] Doorloop de Studie-Keuze Quiz zonder vast te lopen
- [ ] Test of de 'Compare' functionaliteit correct programma's vergelijkt
- [ ] Controleer of alle links naar de 'About' pagina werken

### Authenticatie & Security Tests
- [ ] Test een succesvolle login (JWT token wordt geaccepteerd)
- [ ] Verifieer of uitgelogde gebruikers NIET bij de admin-sectie kunnen
- [ ] Test de Wachtwoord Reset functionaliteit

## Bug Report Template

When a bug is discovered during QA testing, it must be logged using the following format to ensure the development team can reproduce and resolve it efficiently:

*   **Issue Title:** [Short, descriptive title of the problem]
*   **Severity:** [Blocker / High / Medium / Low / Cosmetic]
*   **Module:** [Frontend / Backend / Database / UI]
*   **Steps to Reproduce:**
    1. Go to '...'
    2. Click on '....'
    3. Scroll down to '....'
    4. See error
*   **Expected Behavior:** [What should have happened]
*   **Actual Behavior:** [What actually happened]
*   **Environment:** [e.g., Desktop Chrome, Mobile Safari, Localhost Port 3000]
*   **Screenshots/Logs:** [Attach if applicable]
