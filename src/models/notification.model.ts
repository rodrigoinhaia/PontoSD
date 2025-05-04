import { Company } from './company.model';
import { DataTypes, Model } from 'sequelize';
import { Department } from './department.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Notification extends Model {
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public departmentId!: string;
  public type!: 'POINT_STATUS' | 'REPORT_READY' | 'SYSTEM' | 'OVERTIME' | 'VACATION';
  public title!: string;
  public message!: string;
  public read!: boolean;
  public metadata?: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Department,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('POINT_STATUS', 'REPORT_READY', 'SYSTEM', 'OVERTIME', 'VACATION'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
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
        fields: ['departmentId'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['read'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
); 