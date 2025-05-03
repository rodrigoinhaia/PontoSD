import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';
import { Session } from './session.model';

export class UserSession extends Model {
  public id!: number;
  public userId!: number;
  public sessionId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSession.init(
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
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'user_sessions',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['sessionId'],
      },
      {
        unique: true,
        fields: ['userId', 'sessionId'],
      },
    ],
  }
);

UserSession.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(UserSession, { foreignKey: 'userId' });

UserSession.belongsTo(Session, { foreignKey: 'sessionId' });
Session.hasMany(UserSession, { foreignKey: 'sessionId' }); 