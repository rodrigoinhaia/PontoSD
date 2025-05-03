import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Token extends Model {
  public id!: number;
  public userId!: number;
  public token!: string;
  public type!: 'refresh' | 'reset' | 'verify';
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Token.init(
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
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    type: {
      type: DataTypes.ENUM('refresh', 'reset', 'verify'),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tokens',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['token'],
      },
      {
        fields: ['type'],
      },
      {
        fields: ['expiresAt'],
      },
    ],
  }
);

Token.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Token, { foreignKey: 'userId' }); 