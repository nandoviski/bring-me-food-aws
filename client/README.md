# Developing the shopping cart

- almost done, just need to fix the image in the Sheet component
- implement the checkout button

In the chef's page

- need to fix the view more button

# General

- the code is a mess, remove comments and old imports
- Review the Toaster in the main layout page, why are we using it? (I think it was used in the weekly menu page to show a message when the meal is added to cart, we can still implement the message, but I don't think we need that page anymore)

# Docker Postgres

- Tuto: https://www.linkedin.com/pulse/configuring-connecting-postgresql-database-docker-dqeze/
  - currently using docker desktop
  - docker run -d --name mypostgres -p 5432:5432 -e POSTGRES_PASSWORD=yourpassword postgres

# Redux and Server side

https://youtu.be/KAV8vo7hGAo?si=-daH_nvoiYM4GbE-

# AWS

- diagram + aws explanation: https://youtu.be/KAV8vo7hGAo?si=SMB6XFOSJKCscgWr&t=27036
- had to create a token to access github from aws, see: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/ creating-a-personal-access-token
  - In the upper-right corner of any page on GitHub, click your profile picture, then click Settings.
  - In the left sidebar, click Developer settings.
  - In the left sidebar, under Personal access tokens, click Fine-grained tokens.
  - Click Generate new token.
  - Under Token name, enter a name for the token.
- PM2: run the server automatically if it goes down and up again: https://youtu.be/KAV8vo7hGAo?si=b3SRmwgQTyyea4mX&t=28748

  - it uses "ecosystem.config.js"

EC2 commands:

- npx prisma generate
- npx prisma migrate dev --name xxxx
- ?pnpm seed?
- pm2 delete all (when you want to stop everything)
- pm2 start ecosystem.config.js (to start everything again)
