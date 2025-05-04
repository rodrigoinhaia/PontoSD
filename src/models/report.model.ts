import { Company } from './company.model';
import { DataTypes, Model } from 'sequelize';
import { Department } from './department.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Report extends Model {
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public departmentId!: string;
  public type!: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  public format!: 'PDF' | 'EXCEL' | 'CSV';
  public data!: Record<string, any>;
  public fileUrl?: string;
  public error?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Report.init(
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
      type: DataTypes.ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'),
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
      type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    format: {
      type: DataTypes.ENUM('PDF', 'EXCEL', 'CSV'),
      allowNull: false,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'reports',
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
        fields: ['status'],
      },
      {
        fields: ['startDate'],
      },
      {
        fields: ['endDate'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
); 