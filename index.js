var utils = require('zefti-utils');
var resolve3Arguments = utils.resolve3Arguments;
var resolve4Arguments = utils.resolve4Arguments;
var Mongo = function(db){
  this.db = db;
  return this;
};

var operatorMap = {
    '$del' : '$unset'
  , '$inc' : '$inc'
  , '$dec' : '$inc'
  , '$push' : '$addToSet'
  , '$pull' : '$pullAll'
};

var findOperatorMap = {
    '$gt' : '$gt'
  , '$gte' : '$gte'
  , '$lt' : '$lt'
  , '$lte' : '$lte'
  , '$pull' : '$pullAll'
};

Mongo.prototype.count = function(){
  this.db.count.apply(this.db, arguments);
};

Mongo.prototype.info = function(cb){
  this.db.stats(function(err, res){
    return cb(err, res);
  });
};

Mongo.prototype.create = function(){
  var intArgs = resolve3Arguments(arguments);
  var cb = intArgs[intArgs.length-1];
  var hash = intArgs[0];
  if (utils.isEmpty(hash)) return cb({errCode:'56f6e1abec4ad22804a064f2'});
  var interimCb = function(err, result){
    if(!err && result.result && result.result.ok) return cb(null, hash);
    return cb(err, result);
  };
  intArgs[intArgs.length-1] = interimCb;
  this.db.insert.apply(this.db, intArgs);
};

Mongo.prototype.find = function(){
  var intArgs = resolve4Arguments(arguments);
  var hash = intArgs[0];
  var fieldMask = intArgs[1];
  var options = intArgs[2];
  var cb = intArgs[3];
  var query = formatQuery(hash);
  intArgs[0] = query;
  var interimCb = function(err, result){
    result.toArray(function(err, result2){
      cb(err, result2);
    });
  };
  intArgs[intArgs.length-1] = interimCb;
  this.db.find.apply(this.db, intArgs);
};

function formatQuery(hash){
  var query = {};
  for (var key in hash) {
    if (!findOperatorMap[key]) {
      query[key] = hash[key];
    } else {
      for (var key2 in hash[key]) {
        if (!query[key2]) {
          query[key2] = {};
        }
        query[key2][key] = hash[key][key2];
      }
    }
  }
  return query;
}


Mongo.prototype.update = function(){
  var intArgs = resolve4Arguments(arguments);
  var hash = intArgs[0];
  var update = intArgs[1];
  var options = intArgs[2];
  var cb = intArgs[3];
  var update2 = formatUpdate(update);
  var interimCb = function(err, result){
    if (err || !result || !result.result || result.result.ok !== 1 || result.result.nModified < 1) return cb({errCode:'56b7104cb6a6115737f29ebf', err:err});
    return cb(err, update);
  };
  intArgs[1] = update2;
  intArgs[3] = interimCb;
  //console.log(update2);
  this.db.update.apply(this.db, intArgs);
};



Mongo.prototype.updateById = function(id, update, options, cb){
  //TODO: allow $set and $unset combined
  var intArgs = mongo4Arguments(arguments);
  intArgs[1] = {$set:update};
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
  this.db.update.apply(this.db, intArgs);
};

Mongo.prototype.findAndModify = function(hash, sort, update, options, cb){
  var intArgs = mongo5Arguments(arguments);
  this.db.findAndModify.apply(this.db, intArgs);
  //return cb(null, '1');
};


Mongo.prototype.findById = function(id, fieldMask, options, cb){
  arguments[0] = {_id:id};
  this.findOne.apply(this, arguments);
};

Mongo.prototype.findOne = function(query, fieldMask, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var cbOrig = intArgs[intArgs.length -1];
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};

  var interimCb = function(err, result){
    if (!err && result.length > 1){
      var err = 'findById found 2 results';
    } else {
      result = result[0];
    }
    cbOrig(err, result);
  };
  intArgs[intArgs.length -1] = interimCb
  this.find.apply(this, intArgs);
};

Mongo.prototype.findByIdMulti = function(ids, fieldMask, options, cb){
  var intArgs = mongo4Arguments(arguments);
  intArgs[0] = {_id:{$in:ids}};
  this.find.apply(this, intArgs);
};

Mongo.prototype.upsert = function(hash, update, options, cb){
  //TODO: allow $set and $unset combined
  var intArgs = mongo4Arguments(arguments);
  intArgs[2].upsert = true;
  this.db.update.apply(this.db, intArgs);
};

Mongo.prototype.remove = function(hash, options, cb){
  var intArgs = mongo3Arguments(arguments);
  this.db.remove.apply(this.db, intArgs);
};

Mongo.prototype.removeById = function(id, options, cb){
  var intArgs = mongo3Arguments(arguments);
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
  this.db.remove.apply(this.db, intArgs);
};

Mongo.prototype.removeFields = function(hash, update, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var removeUpdate = {$unset:update};
  intArgs[1] = removeUpdate;
  this.db.update.apply(this.db, intArgs);
};

Mongo.prototype.removeFieldsById = function(id, fields, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var removeUpdate = {$unset:intArgs[1]};
  intArgs[1] = removeUpdate;
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
  this.db.update.apply(this.db, intArgs);
};

//TODO: only expose this in dev environments
Mongo.prototype.removeAll = function(cb){
  this.db.remove({}, function(err, result){
    if (cb) return cb(err, result)
  });
};

Mongo.prototype.addToSet = function(hash, update, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var addToSetUpdate = {addToSet:intArgs[1]};
  intArgs[1] = addToSetUpdate;
  this.db.update.apply(this.db, intArgs);
}

Mongo.prototype.addToSetById = function(id, update, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var addToSetUpdate = {$addToSet:intArgs[1]};
  intArgs[1] = addToSetUpdate;
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
  this.db.update.apply(this.db, intArgs);
}

Mongo.prototype.removeFromSet = function(hash, update, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var removeFromSetUpdate = {$pull:intArgs[1]};
  intArgs[1] = removeFromSetUpdate;
  this.db.update.apply(this.db, intArgs);
}

Mongo.prototype.removeFromSetById = function(id, update, options, cb){
  var intArgs = mongo4Arguments(arguments);
  var removeFromSetUpdate = {$pull:intArgs[1]};
  intArgs[1] = removeFromSetUpdate;
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
  this.db.update.apply(this.db, intArgs);
}

Mongo.prototype.expire = function(hash, options, cb){

}

Mongo.prototype.expireById = function(id, options, cb){

}

Mongo.prototype.getNewId = function(options){

}

function mongo5Arguments(arguments){
  return mongoArguments(arguments, 5);
}

function mongo4Arguments(arguments){
  return mongoArguments(arguments, 4);
}

function mongo3Arguments(arguments){
  return mongoArguments(arguments, 3);
}

function mongoArguments(arguments, num){
  var intArgs = [];
  var newArgs = Array.prototype.slice.call(arguments);
  if (newArgs.length === num) return newArgs;
  if (newArgs.length > 1) {
    intArgs[num-1] = newArgs.splice([newArgs.length - 1])[0] || function(){};
    num -= 1;
  }
  for(var i=0;i<num; i++){
    intArgs[i] = newArgs[i] || {};
  }
  return intArgs;
}

function formatUpdate(hash){
  var finalHash = {};
  for (var key in hash) {
    var operator = operatorMap[key] || '$set';
    if (!finalHash[operator]) finalHash[operator] = {};

    if (operator === '$unset'){
      hash[key].forEach(function(field){
        finalHash[operator][field] = "";
      });
    }

    if (operator === '$set') {
      finalHash[operator][key] = hash[key];
    }

    if (operator === '$inc' || operator === '$dec') {
      for (var key2 in hash[key]) {
        if (key === '$inc') finalHash[operator][key2] = hash[key][key2];
        if (key === '$dec') {
          finalHash[operator][key2] = -hash[key][key2];
        }
      }
    }

    if (operator === '$addToSet') {
      for (var key2 in hash[key]) {
        if (!finalHash[operator][key2]) finalHash[operator][key2] = {'$each':hash[key][key2]};
      }
    }

    if (operator === '$pullAll') {
      for (var key2 in hash[key]) {
        finalHash[operator][key2] = hash[key][key2];
      }
    }
  }
  return finalHash;
}




module.exports = Mongo;