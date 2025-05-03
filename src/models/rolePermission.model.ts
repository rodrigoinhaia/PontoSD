import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Role } from './role.model';
import { Permission } from './permission.model';

export class RolePermission extends Model {
  public id!: number;
  public roleId!: number;
  public permissionId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
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
    tableName: 'role_permissions',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['roleId'],
      },
      {
        fields: ['permissionId'],
      },
      {
        unique: true,
        fields: ['roleId', 'permissionId'],
      },
    ],
  }
);

RolePermission.belongsTo(Role, { foreignKey: 'roleId' });
Role.hasMany(RolePermission, { foreignKey: 'roleId' });

RolePermission.belongsTo(Permission, { foreignKey: 'permissionId' });
Permission.hasMany(RolePermission, { foreignKey: 'permissionId' }); 