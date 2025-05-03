import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Role } from './role.model';

export class UserRole extends Model {
  public id!: number;
  public userId!: number;
  public roleId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserRole.init(
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
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'user_roles',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['roleId'],
      },
      {
        unique: true,
        fields: ['userId', 'roleId'],
      },
    ],
  }
);

UserRole.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserRole, { foreignKey: 'userId' });

UserRole.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(UserRole, { foreignKey: 'roleId' }); 