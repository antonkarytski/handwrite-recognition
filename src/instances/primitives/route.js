const express = require("express");
const router = express.Router();
const Primitive = require("./model");

// Create a new primitive
router.post("/primitives", async (req, res) => {
  try {
    // Create a new primitive instance
    const newPrimitive = await Primitive.create({
      points: req.body.points,
      value: req.body.value,
      feature_path_count: req.body.feature_path_count,
      feature_points_count: req.body.feature_points_count,
      origin_drawing_id: req.body.origin_drawing_id,
    });

    // Respond with the newly created primitive
    res.status(201).json(newPrimitive);
  } catch (error) {
    console.error("Error creating primitive:", error);
    res.status(500).json({ error: "Could not create primitive" });
  }
});

module.exports = router;
