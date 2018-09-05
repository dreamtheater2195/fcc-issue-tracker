/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var { Project } = require('./../models/project');
var { Issue } = require('./../models/issue');
var _ = require('lodash');
module.exports = function (app, db) {
  app.route('/api/:project')
    .get((req, res) => {
      const { project } = req.params;
      Project.findOne({name: project}, (err, doc) => {
        if (doc) {
          return res.status(200).send(doc);
        }
      });
      const newProject = new Project({name: project});
      newProject.save((err, doc) => {
        if (err) {
          return res.status(500).send({error: err});
        }
        res.status(200).send(newProject);
      });
    });
  
  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      const projectName = req.params.project;
      try {
        const project = await Project.findOne({name: projectName});
        if (!project) {
          return res.status(400).send({ error: 'Project not found'});
        }
        const issues = await Issue.find(req.query);
        res.status(200).send({issues});
      } catch (err) {
        res.status(400).send(err);
      }
    })
    
    .post(async (req, res) => {
      const projectName = req.params.project;
      let projectId;
      try {
        const project = await Project.findOne({name: projectName});
        if (!project) {
          const newProject = { name: projectName };
          const { _id } = await newProject.save();
          projectId = _id;
        } else {
          projectId = project._id;
        }
        const {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;
        const issue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || "",
          status_text: status_text || "",
          created_on: new Date(),
          updated_on: new Date(), 
          open: true, 
          projectId
        });
        const newDoc = await issue.save();
        res.send({issue: newDoc});
      } catch (err) {
        res.status(400).send(err);
      }
    })
    
    .put(async (req, res) => {
      const projectName = req.params.project;
      try {
        const project = await Project.findOne({name: projectName});
        if (!project) {
          return res.status(400).send({ error: 'Project not found'});
        }
        const body = _.pick(req.body, ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', 'open']);
        
        if (Object.keys(body).length === 0) {
          return res.status(400).send({error: 'no updated field sent'});
        }
        body.updated_on = new Date();
        
        const issue = await Issue.findOneAndUpdate(
          {_id: req.body._id, projectId: project._id},
          {$set: body},
          {new: true}
        );
        if (!issue) {
          return res.status(400).send({error: `could not update ${req.body._id}`});
        }
        res.status(200).send({issue});
      } catch (err) {
        res.status(400).send(err);
      }
    })
    
    .delete(async (req, res) => {
      const projectName = req.params.project;
      try {
        const project = await Project.findOne({name: projectName});
        if (!project) {
          return res.status(400).send({ error: 'Project not found'});
        }
        const id = req.body._id;
        
        if (!id) {
          return res.status(400).send({error: '_id error'});
        }
        const issue = await Issue.findOneAndRemove(
          {_id: id, projectId: project._id},
        );
        if (!issue) {
          return res.status(400).send({error: `could not delete ${id}`});
        }
        res.status(200).send({issue});
      } catch (err) {
        res.status(400).send(err);
      }
    });
    
};
