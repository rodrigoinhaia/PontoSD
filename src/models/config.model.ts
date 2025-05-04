import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Company } from './company.model';

export class Config extends Model {
  public id!: string;
  public companyId!: string;
  public lateTolerance!: number;
  public earlyExitTolerance!: number;
  public lunchTime!: number;
  public minInterval!: number;
  public maxInterval!: number;
  public active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Config.init(
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
    lateTolerance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        notEmpty: true,
        min: 0,
        max: 60,
      },
    },
    earlyExitTolerance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        notEmpty: true,
        min: 0,
        max: 60,
      },
    },
    lunchTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        notEmpty: true,
        min: 30,
        max: 120,
      },
    },
    minInterval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        notEmpty: true,
        min: 15,
        max: 60,
      },
    },
    maxInterval: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      validate: {
        notEmpty: true,
        min: 30,
        max: 120,
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'configs',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['companyId'],
      },
    ],
  }
);

// Relacionamentos
Config.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
}); 