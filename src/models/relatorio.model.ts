import { DataTypes, Model } from 'sequelize';

import { Empresa } from './empresa.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Relatorio extends Model {
  public id!: number;
  public userId!: number;
  public companyId!: number;
  public type!: 'daily' | 'weekly' | 'monthly' | 'yearly';
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'pending' | 'processing' | 'completed' | 'failed';
  public filePath?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Relatorio.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'relatorios',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['companyId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

Relatorio.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Relatorio, { foreignKey: 'userId' });

Relatorio.belongsTo(Empresa, { foreignKey: 'companyId' });
Empresa.hasMany(Relatorio, { foreignKey: 'companyId' }); 