module.exports = {
  apps: [
    {
      name: "bring-me-food",
      script: "pnpm",
      args: "dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
