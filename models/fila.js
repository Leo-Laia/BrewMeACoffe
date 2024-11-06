'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fila extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Fila.init({
    pessoaId: DataTypes.INTEGER,
    posicao: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Fila',
  });
  return Fila;
};