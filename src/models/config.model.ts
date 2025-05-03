import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Empresa } from './empresa.model';

export class Config extends Model {
  public id!: number;
  public empresaId!: number;
  public toleranciaAtraso!: number;
  public toleranciaSaida!: number;
  public horarioAlmoco!: number;
  public intervaloMinimo!: number;
  public intervaloMaximo!: number;
  public ativo!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Config.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    empresaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id',
      },
    },
    toleranciaAtraso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        notEmpty: true,
        min: 0,
        max: 60,
      },
    },
    toleranciaSaida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        notEmpty: true,
        min: 0,
        max: 60,
      },
    },
    horarioAlmoco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        notEmpty: true,
        min: 30,
        max: 120,
      },
    },
    intervaloMinimo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        notEmpty: true,
        min: 15,
        max: 60,
      },
    },
    intervaloMaximo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        notEmpty: true,
        min: 30,
        max: 120,
      },
    },
    ativo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'configs',
    modelName: 'Config',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['empresaId'],
      },
    ],
  }
);

// Relacionamentos
Config.belongsTo(Empresa, {
  foreignKey: 'empresaId',
  as: 'empresa',
}); 