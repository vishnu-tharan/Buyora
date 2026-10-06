# Buyora

Developer: Vishnu

The Next.js website is in **BuyoraFrontend/**. The Spring Boot API is in **BuyoraBackend/**.

## Running Buyora with Docker

Install and start Docker Desktop with Linux containers, or Docker Engine with Compose v2 or later. You do not need Node.js, Java, Maven, PostgreSQL or Redis on the host to run the application.

1. Clone the repository and open its root folder.
2. Copy .env.example to .env and set POSTGRES_PASSWORD and JWT_SECRET to separate strong random values. The configuration contains no default signing secret.
3. Run:

~~~sh
docker compose up --build
~~~

Open http://localhost:3000. The API is at http://localhost:8080 and the local test inbox is at http://localhost:8025. Register through the website and open the verification link in the test inbox. There is no default admin password.

~~~sh
# Run in background
docker compose up -d --build
# View status and logs
docker compose ps
docker compose logs -f backend
# Stop while keeping database data
docker compose down
~~~

**Reset only when you intend to delete all local database data:** docker compose down -v.

See [Docker setup](docs/DOCKER_SETUP.md) for secret generation, port changes, admin setup, networking, backups, troubleshooting and verification results. Run Compose from this root folder; the old backend-only Compose file has been superseded.

The Docker runtime uses production builds with local development services and HTTP cookies. It is not a production deployment configuration. The [system audit](BuyoraFrontend/docs/BUYORA_SYSTEM_AUDIT.md) records application work still required for production acceptance.

## Shopping and design update

See [the October improvement and verification report](docs/verification/SHOPPING_IMPROVEMENTS.md) for implemented features, screenshots, and integration checks still needed before launch.
