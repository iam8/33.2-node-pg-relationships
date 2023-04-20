// Ioana A Mititean
// Exercise 33.1: Node-pg Intro

/** Server startup for BizTime. */


const { app } = require("./app");


app.listen(3000, "127.0.0.1", () => {
    console.log("Listening on 127.0.0.1, port 3000");
});
