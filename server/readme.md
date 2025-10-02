# Docker Postgres

- Tuto: https://www.linkedin.com/pulse/configuring-connecting-postgresql-database-docker-dqeze/
- currently using docker desktop
- docker run -d --name mypostgres -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres
- to access the database I'm using a VSCode Extension

# Prisma

- npm seed: (PS: will wipe the tables before seed) to seed the database with initial data
- npx prisma migrate dev --name init: to create the initial migration and set up the database schema
- npx prisma reset: to reset the database and apply the latest migrations (clean slate)

# Known Issues

- when editing a menu, the date picker doesn't load the existing dates correctly. It shows the current date instead of the menu's start and end dates. This is likely due to how the date values are being passed to the date picker component
