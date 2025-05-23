import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Schedule extends Model {
  public id!: number;
  public name!: string;
  public entryTime!: string;
  public exitTime!: string;
  public tolerance!: number;
  public companyId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Schedule.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entryTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    exitTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tolerance: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'schedules',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['companyId'],
      },
      {
        unique: true,
        fields: ['name', 'companyId'],
      },
    ],
  }
); 