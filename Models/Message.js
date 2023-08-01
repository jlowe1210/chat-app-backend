const { DataTypes, Model } = require("sequelize");
const sequelize = require("../db");

class Message extends Model {}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },

    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    framework: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Message",
  }
);

module.exports = Message;
