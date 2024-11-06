'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Fila extends Model {
    static associate(models) {
      Fila.belongsTo(models.Pessoa, {
        foreignKey: 'pessoaId',
        as: 'pessoa',
      });
    }
  }
  Fila.init(
    {
      pessoaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      posicao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Fila',
    }
  );
  return Fila;
};
