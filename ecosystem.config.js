module.exports = {
  apps : [{
    name   : "dailydev-backend",
    script : "./dist/src/app.js",
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
