import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Departamento } from './departamento.model';
import { Schedule } from './schedule.model';

export class Colaborador extends Model {
  public id!: number;
  public userId!: number;
  public departmentId!: number;
  public scheduleId!: number;
  public admissionDate!: Date;
  public status!: 'active' | 'inactive';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Colaborador.init(
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
    departmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'departamentos',
        key: 'id',
      },
    },
    scheduleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schedules',
        key: 'id',
      },
    },
    admissionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'colaboradores',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
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
    ],
  }
);

Colaborador.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Colaborador, { foreignKey: 'userId' });

Colaborador.belongsTo(Departamento, { foreignKey: 'departmentId' });
Departamento.hasMany(Colaborador, { foreignKey: 'departmentId' });

Colaborador.belongsTo(Schedule, { foreignKey: 'scheduleId' });
Schedule.hasMany(Colaborador, { foreignKey: 'scheduleId' }); 