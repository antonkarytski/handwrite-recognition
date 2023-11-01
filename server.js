const express = require("express");
const cors = require("cors");
const primitivesRouter = require("./src/instances/primitives/route");
const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());
// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.use("/primitives", primitivesRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
