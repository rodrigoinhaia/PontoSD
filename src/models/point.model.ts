import { Company } from './company.model';
import { DataTypes, Model } from 'sequelize';
import { Department } from './department.model';
import { Schedule } from './schedule.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Point extends Model {
  public id!: string;
  public userId!: string;
  public companyId!: string;
  public departmentId!: string;
  public scheduleId!: string;
  public type!: 'ENTRY' | 'EXIT' | 'BREAK_START' | 'BREAK_END';
  public latitude!: number;
  public longitude!: number;
  public address!: string;
  public photoUrl?: string;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Point.init(
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
    scheduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Schedule,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('ENTRY', 'EXIT', 'BREAK_START', 'BREAK_END'),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'points',
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
        fields: ['scheduleId'],
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