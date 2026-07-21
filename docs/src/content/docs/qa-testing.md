---
title: QA Testing & Bug Reporting
description: Standardized procedures for testing frontend flows and API endpoints.
---

## Quality Assurance Methodology

As the application is being rebuilt, all new modules will undergo rigorous testing before being merged into the production branch. This includes:
1.  **Endpoint Testing:** Verifying standard REST methods (GET, POST, PUT, DELETE) using local API clients.
2.  **UI/UX Testing:** Ensuring responsive design integrity and verifying routing through TanStack Start.
3.  **Authentication Testing:** Validating protected routes and login/register flows.

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
