const { Sequelize, DataTypes, QueryTypes, Model } = require('sequelize');
const Promise = require('bluebird');
require('dotenv').config();

// const sequelize = new Sequelize(`postgres://${process.env.pgUser}:${process.env.pgPassword}@localhost:${process.env.pgPORT}/sdc`, {
//   logging: false,
// });

const sequelize = new Sequelize(`postgres://${process.env.cloudUser}:${process.env.cloudPass}@${process.env.cloudURL}:${process.env.pgPORT}/flamingos_qa`, {
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to sdc db successful');
  })
  .catch((err) => {
    console.error('Error establishing connection with db:', err);
  });

const Questions = sequelize.define('Questions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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
    autoIncrement: true,
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

const Photos = sequelize.define('Photos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
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

const QuestionFormat = (data) => (
  {
    question_id: data.id,
    question_body: data.body,
    question_date: new Date(Number(data.date_written)).toISOString(),
    asker_name: data.asker_name,
    question_helpfulness: data.helpful,
    reported: Boolean(data.reported),
    answers: {},
  }
);

const QuestionFormatJoin = (data) => (
  {
    question_id: data.question_id,
    question_body: data.question_body,
    question_date: new Date(Number(data.question_date)).toISOString(),
    asker_name: data.asker_name,
    question_helpfulness: data.question_helpfulness,
    reported: false,
    answers: {},
  }
);

const AnswerFormat = (data) => (
  {
    id: data.id,
    body: data.body,
    date: new Date(Number(data.date_written)).toISOString(),
    answerer_name: data.answerer_name,
    helpfulness: data.helpful,
    photos: [],
  }
);

const AnswerFormatJoin = (data) => (
  {
    id: data.answer_id,
    body: data.answer_body,
    date: new Date(Number(data.answer_date)).toISOString(),
    answerer_name: data.answerer_name,
    helpfulness: data.answer_helpfulness,
    photos: [],
  }
);

const getQuestionsByProductId = (product_id) => (
  Questions.findAll({
    attributes: ['id', 'body', 'date_written', 'asker_name', 'helpful'],
    where: {
      product_id,
      reported: false,
    },
  })
    .then((response) => response.map(QuestionFormat))
    .catch((err) => {
      console.log('Error db.getQuestionsById', err);
    })
);

const getPhotosByAnswerId = (answer_id) => (
  Photos.findAll({
    attributes: ['answer_id', 'url'],
    where: {
      answer_id,
    },
  })
    .then((response) => response)
    .catch((err) => {
      console.log('Error db.getPhotosByAnswerId', err);
    })
);

const getAnswersByQuestionId = (question_id) => {
  const answers = {};
  return Answers.findAll({
    attributes: ['id', 'body', 'date_written', 'answerer_name', 'helpful'],
    where: {
      question_id,
      reported: false,
    },
  })
    .then((response) => {
      const photosArr = [];
      response.forEach((ans) => {
        answers[ans.id] = AnswerFormat(ans);
        photosArr.push(getPhotosByAnswerId(ans.id));
      });
      return Promise.all(photosArr);
    })
    .then((response) => {
      response.forEach((photoArray) => {
        photoArray.forEach((photo) => {
          answers[photo.answer_id].photos.push(photo.url);
        });
      });
      return answers;
    })
    .catch((err) => {
      console.log('Error in db.getAnswersByQuestionId', err);
    });
};

const getQAbyProductId = (product_id) => {
  let qaResult = [];

  return getQuestionsByProductId(product_id)
    .then((res) => {
      qaResult = res;
      const promiseArray = [];
      qaResult.forEach((q) => {
        promiseArray.push(getAnswersByQuestionId(q.question_id));
      });
      return Promise.all(promiseArray);
    })
    .then((res) => {
      res.forEach((answerArr, i) => {
        qaResult[i].answers = answerArr;
      });
      return qaResult;
    })
    .catch((err) => {
      console.log('Error in db.getQAbyProductId', err);
    });
};

// combining above process into on query in outer join, using parameter from business docs
const getQAbyProductId2 = (product_id, page, count) => {
  const qaResults = [];
  const limit = count;
  const offset = (page * count) - count;
  return sequelize.query(`SELECT "Questions".id AS question_id, "Questions".body AS question_body, "Questions".date_written AS question_date, asker_name, "Questions".helpful AS question_helpfulness, "Answers".id AS answer_id, "Answers".body AS answer_body, "Answers".date_written AS answer_date, "Answers".answerer_name, "Answers".helpful AS answer_helpfulness, "Photos".url
  FROM (SELECT * FROM "Questions" WHERE product_id = ${product_id} AND "Questions".reported = false ORDER BY "Questions".id LIMIT ${limit} OFFSET ${offset}) "Questions" LEFT OUTER JOIN "Answers" ON "Questions".id = "Answers".question_id AND ("Answers".reported = false OR "Answers".reported = null) LEFT OUTER JOIN "Photos" ON "Answers".id = "Photos".answer_id;`, {
    type: QueryTypes.SELECT,
  })
    .then((res) => {
      let i = 0;
      let j;
      let k;
      while (i < res.length) {
        const question = QuestionFormatJoin(res[i]);
        if (res[i].answer_body) {
          j = i;
          while (j < res.length && res[j].question_id === res[i].question_id) {
            k = j;
            const answer = AnswerFormatJoin(res[j]);
            while (k < res.length && res[j].answer_id === res[k].answer_id) {
              if (res[k].url) {
                answer.photos.push(res[k].url);
              }
              k += 1;
            }
            question.answers[answer.id] = answer;
            j = k;
          }
          i = j;
        } else {
          i += 1;
        }
        qaResults.push(question);
      }
      return qaResults;
    })
    .catch((err) => {
      console.log('Error in db.getQAbyProductId2', err);
    });
};

const getAnswersByQuestionId2 = (question_id, page, count) => {
  const photoResults = [];
  const offset = (page - 1 * count);
  const limit = count;
  return sequelize.query(`SELECT "Answers".id AS answer_id, "Answers".body AS answer_body, "Answers".date_written AS answer_date, "Answers".answerer_name, "Answers".helpful AS answer_helpfulness, "Photos".id AS photo_id, "Photos".url from (SELECT * from "Answers" WHERE "Answers".question_id = ${question_id} AND "Answers".reported = false ORDER BY "Answers".id limit ${limit} OFFSET ${offset}) "Answers" LEFT OUTER JOIN "Photos" ON "Answers".id = "Photos".photo_id;`, {
    type: QueryTypes.select,
  })
    .then((res) => {
      let j = 0;
      let k;
      while (j < res.length) {
        k = j;
        const answer = AnswerFormatJoin(res[j]);
        while (k < res.length && res[k].answer_id === res[j].answer_id) {
          if (res[k].url) {
            answer.photos.push({
              id: res[k].photo_id,
              url: res[k].url,
            });
          }
          k += 1;
        }
        j = k;
        photoResults.push(answer);
      }
      return photoResults;
    })
    .catch((err) => {
      console.log('Error in db.getPhotosByAnswerId2', err);
    });
};

const addQuestion = (body, name, email, product_id) => (
  Questions.create({
    product_id,
    body,
    date_written: Date.now(),
    asker_name: name,
    asker_email: email,
    reported: false,
    helpful: 0,
  })
    .then((data) => (
      Answers.create({
        question_id: data.id,
        body: null,
        date_written: null,
        answerer_name: null,
        answerer_email: null,
        reported: null,
        helpful: null,
      })
    ))
);

const addAnswer = (question_id, body, name, email, photos) => (
  Answers.findOne({
    where: {
      question_id,
      body: null,
    },
  })
    .then((data) => {
      if (data) {
        return Answers.update(
          {
            body,
            date_written: Date.now(),
            answerer_name: name,
            answerer_email: email,
            reported: false,
            helpful: 0,
          },
          {
            where: {
              id: data.id,
            },
          },
        );
      }
      return Answers.create({
        question_id,
        body,
        date_written: Date.now(),
        answerer_name: name,
        answerer_email: email,
        reported: false,
        helpful: 0,
      });
    })
    .then((data) => {
      if (photos) {
        const photoArray = photos.map((url) => (
          Photos.create({
            answer_id: data.id,
            url,
          })
        ));
        return Promise.all(photoArray);
      }
    })
);


const setQuestionHelpful = (question_id) => (
  Questions.increment('helpful', {
    where: {
      id: question_id,
    },
  })
);

const reportQuestion = (question_id) => (
  Questions.update(
    {
      reported: true,
    },
    {
      where: {
        id: question_id,
      },
    },
  )
);

const setAnswerHelpful = (answer_id) => (
  Answers.increment('helpful', {
    where: {
      id: answer_id,
    },
  })
);

const reportAnswer = (answer_id) => (
  Answers.update(
    {
      reported: true,
    },
    {
      where: {
        id: answer_id
      },
    },
  )
);

module.exports = {
  getQuestionsByProductId,
  getAnswersByQuestionId,
  getAnswersByQuestionId2,
  getQAbyProductId,
  getQAbyProductId2,
  addQuestion,
  addAnswer,
  setQuestionHelpful,
  reportQuestion,
  setAnswerHelpful,
  reportAnswer,
};
