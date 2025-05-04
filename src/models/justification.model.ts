import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class Justification extends Model {
  public id!: number;
  public pointId!: number;
  public userId!: number;
  public reason!: string;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Justification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pointId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'points',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    tableName: 'justifications',
    timestamps: true,
  }
); 