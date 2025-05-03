import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Timesheet extends Model {
  public id!: number;
  public userId!: number;
  public date!: Date;
  public hoursWorked!: number;
  public overtime?: number;
  public status!: 'pending' | 'approved' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Timesheet.init(
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
    hoursWorked: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },
    overtime: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'timesheets',
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
        fields: ['status'],
      },
    ],
  }
);

Timesheet.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Timesheet, { foreignKey: 'userId' });

export default Timesheet; 