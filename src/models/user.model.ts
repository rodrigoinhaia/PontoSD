import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { Company } from './company.model';
import { Department } from './department.model';

export class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: 'ADMIN' | 'MANAGER' | 'USER';
  public companyId!: string;
  public departmentId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('ADMIN', 'MANAGER', 'USER'),
      allowNull: false,
      defaultValue: 'USER',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Company,
        key: 'id',
      },
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Department,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['email'],
      },
      {
        fields: ['role'],
      },
      {
        fields: ['companyId'],
      },
      {
        fields: ['departmentId'],
      },
    ],
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
); 