import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Justificativa extends Model {
  public id!: number;
  public userId!: number;
  public date!: Date;
  public type!: 'late' | 'early' | 'absence';
  public reason!: string;
  public status!: 'pending' | 'approved' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Justificativa.init(
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('late', 'early', 'absence'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'justificativas',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['date'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

Justificativa.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Justificativa, { foreignKey: 'userId' }); 