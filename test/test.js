var assert = require('assert');
var async = require('async');
var ZeftiMongoInterface = require('zefti-mongo-interface');
var zeftiTest = require('zefti-test');
var dbTests = zeftiTest.dbTests;
var dependencies = zeftiTest.dependencies;

/* databases */
var mongoTestDb = dependencies.dataSources.mongoTest;
var mongoTest = new ZeftiMongoInterface(mongoTestDb);


dbTests.setup(mongoTest);
dbTests.info(mongoTest);
dbTests.createWithoutContent(mongoTest);
//dbTests.createWithoutPrimaryKey(mongoTest);
dbTests.createItem(mongoTest);
dbTests.findById(mongoTest);
dbTests.updateNew(mongoTest);
//dbTests.updateOld(mongoTest);
dbTests.removeField(mongoTest);
dbTests.multiUpdate(mongoTest);
dbTests.updateAndRemoveField(mongoTest);
dbTests.updateAndMultiFieldDelete(mongoTest);
dbTests.increment(mongoTest);
dbTests.incrementNewAndExisting(mongoTest);
dbTests.incrementAndDecrement(mongoTest);
dbTests.setAddition(mongoTest);
dbTests.setRemoval(mongoTest);
dbTests.findByFieldEquality(mongoTest);
dbTests.findByDualFieldEquality(mongoTest);
dbTests.findWithGtAndLt(mongoTest);