const { DataTypes } = require("sequelize");
const sequelize = require("../../db/connection");

const Primitive = sequelize.define("Primitive", {
  points: DataTypes.STRING,
  value: DataTypes.STRING,
  feature_path_count: DataTypes.STRING,
  feature_points_count: DataTypes.STRING,
  origin_drawing_id: DataTypes.STRING,
});

module.exports = Primitive;
