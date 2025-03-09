// Lee-Ben-Shimon-322978909
// Linoy-Eligulashvili-213655590

// const { init } = require("../models/posts_model");

import initApp from "./server"

const port = process.env.PORT;

initApp().then((app) => {
    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
});


