const { Sequelize, Model, DataTypes } = require('sequelize');
const Promise = require('bluebird');
require('dotenv').config();

const sequelize = new Sequelize(`postgres://${process.env.pgUser}:${process.env.pgPassword}@localhost:${process.env.pgPORT}/sdc`);

sequelize.authenticate()
.then(() => {
  console.log('Connection to sdc db successful');
})
.catch((err) => {
  console.error('Error establishing connection with db:', err)
});

const Questions = sequelize.define('Questions', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_written: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  asker_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  asker_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reported: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  helpful: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Answers = sequelize.define('Answers', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_written: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  answerer_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  answerer_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  reported: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  helpful: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const AnswersPhotos = sequelize.define('AnswersPhotos', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  answer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const getQuestionsByProductId = (product_id) => (
  Questions.findAll({
    where: {
      product_id,
      reported: false,
    },
  })
  .then((response) => response.map(Question))
  .catch((err) => {
    console.log('Error retrieving questions by id: getQuestionsById', err);
  })
)