import { DataTypes, Model } from 'sequelize';
import { Empresa } from './empresa.model';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Departamento extends Model {
  public id!: number;
  public name!: string;
  public companyId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Departamento.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'departamentos',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['name'],
      },
      {
        fields: ['companyId'],
      },
      {
        unique: true,
        fields: ['name', 'companyId'],
      },
    ],
  }
);

// Relacionamentos
Departamento.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Departamento, { foreignKey: 'departmentId' });

Departamento.belongsTo(Empresa, { foreignKey: 'companyId' });
Empresa.hasMany(Departamento, { foreignKey: 'companyId' }); 