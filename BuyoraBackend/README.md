# Buyora Backend

Developer: Vishnu

For the full Docker stack, run docker compose up --build from the repository root. See [Docker setup](../docs/DOCKER_SETUP.md). This folder is only the corresponding image build context.

For non-Docker development, use Java 21 and the included Maven wrapper. Maven package runs unit tests; Maven verify also runs database integration tests and requires Docker. Application settings are supplied through environment variables; Maven does not automatically load .env.
