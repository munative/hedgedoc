'use strict'

const Router = require('express').Router

const workspace = require('../workspace')
const workspaceRouter = module.exports = Router()

// get history
workspaceRouter.get('/workspace', workspace.workspaceGet)
