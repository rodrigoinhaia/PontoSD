import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Token } from './token.model';

export class UserToken extends Model {
  public id!: number;
  public userId!: number;
  public tokenId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserToken.init(
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
    tokenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tokens',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'user_tokens',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['tokenId'],
      },
      {
        unique: true,
        fields: ['userId', 'tokenId'],
      },
    ],
  }
);

UserToken.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserToken, { foreignKey: 'userId' });

UserToken.belongsTo(Token, { foreignKey: 'tokenId' });
Token.hasMany(UserToken, { foreignKey: 'tokenId' }); 