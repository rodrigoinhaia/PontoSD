import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Colaborador } from './colaborador.model';
import { User } from './user.model';

export class DayOff extends Model {
  public id!: number;
  public colaboradorId!: number;
  public data!: Date;
  public tipo!: 'folga' | 'feriado' | 'compensacao';
  public status!: 'pendente' | 'aprovado' | 'rejeitado';
  public observacao?: string;
  public aprovadoPorId?: number;
  public dataAprovacao?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DayOff.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    colaboradorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'colaboradores',
        key: 'id',
      },
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    tipo: {
      type: DataTypes.ENUM('folga', 'feriado', 'compensacao'),
      allowNull: false,
      validate: {
        notEmpty: true,
        isIn: [['folga', 'feriado', 'compensacao']],
      },
    },
    status: {
      type: DataTypes.ENUM('pendente', 'aprovado', 'rejeitado'),
      allowNull: false,
      defaultValue: 'pendente',
      validate: {
        notEmpty: true,
        isIn: [['pendente', 'aprovado', 'rejeitado']],
      },
    },
    observacao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aprovadoPorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    dataAprovacao: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'dayoffs',
    modelName: 'DayOff',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['colaboradorId'],
      },
      {
        fields: ['data'],
      },
      {
        fields: ['tipo'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['aprovadoPorId'],
      },
    ],
  }
);

// Relacionamentos
DayOff.belongsTo(Colaborador, {
  foreignKey: 'colaboradorId',
  as: 'colaborador',
});

DayOff.belongsTo(User, {
  foreignKey: 'aprovadoPorId',
  as: 'aprovadoPor',
});

export default DayOff; 