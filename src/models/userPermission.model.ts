import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Permission } from './permission.model';

export class UserPermission extends Model {
  public id!: number;
  public userId!: number;
  public permissionId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserPermission.init(
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
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'user_permissions',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['permissionId'],
      },
      {
        unique: true,
        fields: ['userId', 'permissionId'],
      },
    ],
  }
);

UserPermission.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserPermission, { foreignKey: 'userId' });

UserPermission.belongsTo(Permission, { foreignKey: 'permissionId' });
Permission.hasMany(UserPermission, { foreignKey: 'permissionId' }); 