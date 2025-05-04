import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Company } from './company.model';
import { Department } from './department.model';

export class Employee extends Model {
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public departmentId!: string;
  public registrationNumber!: string;
  public position!: string;
  public admissionDate!: Date;
  public status!: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'VACATION';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
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
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    admissionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'VACATION'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    tableName: 'employees',
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
        fields: ['registrationNumber'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
); 