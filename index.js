
var Mongo = function(db){
  this.db = db;
  return this;
};

Mongo.prototype.create = function(){
  var intArgs = mongo3Arguments(arguments);
  var cb = intArgs[intArgs.length-1];
  var hash = intArgs[0];
  var interimCb = function(err, result){
    if(!err && result.result && result.result.ok) return cb(null, hash);
    return cb(err, result);
  };
  intArgs[intArgs.length-1] = interimCb;
  this.db.insert.apply(this.db, intArgs);
};

Mongo.prototype.find = function(){
  var intArgs = mongo4Arguments(arguments);
  var cb = intArgs[intArgs.length-1];
  var interimCb = function(err, result){
    result.toArray(function(err, result2){
      cb(err, result2);
    });
  };
  intArgs[intArgs.length-1] = interimCb;
  this.db.find.apply(this.db, intArgs);
};

Mongo.prototype.findAndModify = function(hash, sort, update, options, cb){
  var intArgs = mongo5Arguments(arguments);
  this.db.findAndModify.apply(this.db, intArgs);
  //return cb(null, '1');
};

/*
Mongo.prototype.findById = function(id, fieldMask, options, cb){
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
*/

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

Mongo.prototype.update = function(hash, update, options, cb){
  //TODO: allow $set and $unset combined
  var intArgs = mongo4Arguments(arguments);
  this.db.update.apply(this.db, intArgs);
};

Mongo.prototype.updateById = function(id, update, options, cb){
  //TODO: allow $set and $unset combined
  var intArgs = mongo4Arguments(arguments);
  intArgs[1] = {$set:update};
  if (typeof intArgs[0] === 'string') intArgs[0] = {_id:intArgs[0]};
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




module.exports = Mongo;