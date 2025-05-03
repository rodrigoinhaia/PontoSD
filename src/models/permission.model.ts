import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Permission extends Model {
  public id!: number;
  public userId!: number;
  public resource!: string;
  public action!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
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
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'permissions',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['resource'],
      },
      {
        fields: ['action'],
      },
      {
        unique: true,
        fields: ['userId', 'resource', 'action'],
      },
    ],
  }
);

Permission.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Permission, { foreignKey: 'userId' }); 