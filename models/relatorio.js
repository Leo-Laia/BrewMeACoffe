'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Relatorio extends Model {
    static associate(models) {
      // Definir associações, se necessário
    }
  }
  Relatorio.init(
    {
      data: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      dados: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Relatorio',
    }
  );
  return Relatorio;
};
