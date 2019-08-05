require('rootpath')();
var Sequelize = require('sequelize');
var mysqlConf = require('conf').mysql;
const fixtures = require('sequelize-fixtures');
const Op = Sequelize.Op;

var sequelize = new Sequelize(mysqlConf.db, mysqlConf.user, mysqlConf.password, {
  host: mysqlConf.host,
  port: mysqlConf.port,
  dialect: mysqlConf.dialect,
  logging(msg) {
    if (mysqlConf.inspect === true) {
      console.log(msg);
    }
  },
  sync: {
    force: true
  },
  pool: {
    min: 0,
    max: 1000,
  },
  operatorsAliases: {
    $and: Op.and,
    $like: Op.like,
    $or: Op.or
  }
});

sequelize.sync({force: true})
.then(function () {
  console.log("Sequelize sync ended / DB updated")

  const Models = require('./index')
  //FIXTURES
  fixtures.loadFile('fixtures/data.json', Models)
  .then(function(){
    console.log('Fixtures inserted')
  })
  .catch(function(err){
    console.log('Error during fixtures insertion')
    console.log(err);
  })
})
.catch(err =>{
  console.log("Sequelize sync error:")
  console.log(err)
})

module.exports = sequelize;
