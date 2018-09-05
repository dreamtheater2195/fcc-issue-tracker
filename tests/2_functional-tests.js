/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var {Issue} = require('../models/issue');
var {Project} = require('../models/project');
var { ObjectID } = require('mongodb');
chai.use(chaiHttp);

const projectOneId = new ObjectID();
const projectTwoId = new ObjectID();
const projects = [
  {
    _id: projectOneId,
    name: 'test'
  },
  {
    _id: projectTwoId,
    name: 'tng'
  },
]

const issues = [
  {
    _id: new ObjectID(),
    open: true,
    issue_title: 'Title 1',
    issue_text: 'Issue text',
    created_by: 'Functional Test - Every field filled in',
    assigned_to: 'Chai and Mocha',
    status_text: 'In QA',
    projectId: projectOneId
  },
  {
    _id: new ObjectID(),
    open: true,
    issue_title: 'Title 2',
    issue_text: 'Issue text',
    created_by: 'Functional Test - Every field filled in',
    assigned_to: 'Chai',
    status_text: 'In QA',
    projectId: projectOneId
  },
  {
    _id: new ObjectID(),
    open: false,
    issue_title: 'Title 3',
    issue_text: 'Issue text',
    created_by: 'Functional Test - Every field filled in',
    assigned_to: 'Chai',
    status_text: 'In QA',
    projectId: projectOneId
  },
  {
    _id: new ObjectID(),
    open: true,
    issue_title: 'Title 5',
    issue_text: 'Issue text',
    created_by: 'Functional Test - Every field filled in',
    assigned_to: 'Chai and Mocha',
    status_text: 'In QA',
    projectId: projectTwoId
  },
];

beforeEach((done) => {
  Project.remove({}).then(() => {
    return Project.insertMany(projects);
  }).then(() => done());
});

beforeEach((done) => {
  Issue.remove({}).then(() => {
    return Issue.insertMany(issues);
  }).then(() => done());
});

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 4',
          issue_text: 'Issue text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'issue');
          assert.equal(res.body.issue.open, true);
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 4',
          issue_text: 'Issue text',
          created_by: 'Functional Test - Required fields filled in'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'issue');
          assert.equal(res.body.issue.open, true);
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title 4',
          issue_text: 'Issue text',
        })
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.body.name, 'ValidationError');
          assert.property(res.body, 'errors');
          done();
        });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .end(function(err, res) {
          assert.equal(res.status, 400);
          assert.property(res.body, 'error');
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: issues[0]._id.toHexString(),
          issue_title: 'Title 2 (Edited)'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'issue');
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: issues[0]._id.toHexString(),
          issue_title: 'Title 2 (Edited)',
          issue_text: "Issue text (Edited)",
          assigned_to: 'Chai',
          open: false
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'issue');
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.issues);
          assert.property(res.body.issues[0], 'issue_title');
          assert.property(res.body.issues[0], 'issue_text');
          assert.property(res.body.issues[0], 'created_on');
          assert.property(res.body.issues[0], 'updated_on');
          assert.property(res.body.issues[0], 'created_by');
          assert.property(res.body.issues[0], 'assigned_to');
          assert.property(res.body.issues[0], 'open');
          assert.property(res.body.issues[0], 'status_text');
          assert.property(res.body.issues[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({open: false})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.issues);
          assert.equal(res.body.issues.length, 1);
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: false,
          assigned_to: 'Chai'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body.issues);
          assert.equal(res.body.issues.filter(issue => issue.assigned_to !== 'Chai' || issue.open === true).length, 0);
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.property(res.body, 'error');
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({_id: issues[0]._id.toHexString()})
        .end(function(err, res){
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });

});
