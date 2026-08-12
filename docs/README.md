# Studie4SU Documentatie
 
Welkom bij de officiële documentatie van het Studie4SU platform.

Deze documentatie bevat onder andere onze QA-testing rapporten, API-referenties en onze setup-guides.
 
## Tech Stack

Deze documentatie is gebouwd met de volgende technologieën:

* **Astro**: Static Site Generator

* **Starlight**: Documentatie-thema voor Astro
 
## Prerequisites

Voordat je deze applicatie lokaal kunt draaien, heb je het volgende nodig:

* [Node.js](https://nodejs.org/)

* [pnpm](https://pnpm.io/) (Package manager)

* De REST Client extensie voor VS Code (voor het testen van de API)
 
## Installation

Om deze documentatie lokaal te installeren:
 
1. Open de terminal in deze map (`docs`).

2. Voer het volgende commando uit om de pakketten te downloaden:

   ```bash

   pnpm install
 
## Usage
Start de server lokaal op om de documentatie te bekijken:
1. Voer dit commando uit in de terminal:
Bash:
pnpm dev
 
1. Open je browser en ga naar http://localhost:4321.

## QA & API Testing
This project uses the REST Client extension for VS Code to perform API verifications and QA testing. To run the API tests:
1. Ensure you have the REST Client extension installed in VS Code.
2. Make sure the Studie4SU backend API server is running locally (e.g., on port 3000).
3. Navigate to the test/ folder and open the api-tests.http file.
4. Click the Send Request text that appears directly above the API endpoints to execute the tests and view the database responses.

## Project Structure
**src/content/docs/:** Contains all the Markdown (.md and .mdx) files for the documentation pages.
**test/:** Contains the HTTP request files used for API testing.
 
 