import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Colaborador } from './colaborador.model';
import { User } from './user.model';

export class Vacation extends Model {
  public id!: number;
  public colaboradorId!: number;
  public dataInicio!: Date;
  public dataFim!: Date;
  public dias!: number;
  public status!: 'pendente' | 'aprovado' | 'rejeitado';
  public observacao?: string;
  public aprovadoPorId?: number;
  public dataAprovacao?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Vacation.init(
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
    dataInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    dataFim: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true,
      },
    },
    dias: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 1,
        max: 30,
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
    tableName: 'vacations',
    modelName: 'Vacation',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['colaboradorId'],
      },
      {
        fields: ['dataInicio'],
      },
      {
        fields: ['dataFim'],
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
Vacation.belongsTo(Colaborador, {
  foreignKey: 'colaboradorId',
  as: 'colaborador',
});

Vacation.belongsTo(User, {
  foreignKey: 'aprovadoPorId',
  as: 'aprovadoPor',
});

export default Vacation; 