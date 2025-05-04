import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './company.model';

export class Configuration extends Model {
  public id!: string;
  public companyId!: string;
  public key!: string;
  public value!: string;
  public type!: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  public description!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Configuration.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON'),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'configurations',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['companyId'],
      },
      {
        fields: ['key'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
); 