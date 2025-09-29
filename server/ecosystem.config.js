module.exports = {
  apps: [
    {
      name: "bring-me-food",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
