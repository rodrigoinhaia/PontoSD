import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Log extends Model {
  public id!: number;
  public userId!: number | null;
  public action!: string;
  public entity!: string;
  public entityId!: number;
  public metadata!: Record<string, any>;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'logs',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['action'],
      },
      {
        fields: ['entity'],
      },
      {
        fields: ['entityId'],
      },
      {
        fields: ['createdAt'],
      },
    ],
  }
);

Log.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Log, { foreignKey: 'userId' }); 