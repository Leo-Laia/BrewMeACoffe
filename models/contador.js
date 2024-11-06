'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contador extends Model {
    static associate(models) {
      Contador.belongsTo(models.Pessoa, {
        foreignKey: 'pessoaId',
        as: 'pessoa',
      });
    }
  }
  Contador.init(
    {
      pessoaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contagem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Contador',
    }
  );
  return Contador;
};
