// models/pessoa.js

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pessoa extends Model {
    static associate(models) {
      // Definir associações aqui, se necessário
      Pessoa.hasOne(models.Contador, {
        foreignKey: 'pessoaId',
        as: 'contador',
      });

      Pessoa.hasMany(models.Historico, {
        foreignKey: 'pessoaId',
        as: 'historicos',
      });

      Pessoa.hasOne(models.Fila, {
        foreignKey: 'pessoaId',
        as: 'fila',
      });
    }
  }
  Pessoa.init(
    {
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telefone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Pessoa'
    }
  );
  return Pessoa;
};
