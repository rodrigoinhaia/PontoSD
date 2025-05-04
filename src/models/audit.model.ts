import { Company } from './company.model';
import { DataTypes, Model } from 'sequelize';
import { Department } from './department.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Audit extends Model {
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public departmentId!: string;
  public entity!: string;
  public entityId!: string;
  public action!: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';
  public changes?: Record<string, any>;
  public ipAddress?: string;
  public userAgent?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Audit.init(
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
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'),
      allowNull: false,
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audits',
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
        fields: ['entity'],
      },
      {
        fields: ['entityId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
); 