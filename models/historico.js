'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Historico extends Model {
    static associate(models) {
      Historico.belongsTo(models.Pessoa, {
        foreignKey: 'pessoaId',
        as: 'pessoa',
      });
    }
  }
  Historico.init(
    {
      pessoaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Historico',
    }
  );
  return Historico;
};
