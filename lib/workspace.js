'use strict'
// history
// external modules
var LZString = require('lz-string')

// core
var logger = require('./logger')
var models = require('./models')
const errors = require('./errors')

// public
var Note = {
  workspaceGet: workspaceGet,
}

function getWorkspaceNotes(userid, callback) {
  models.User.findOne({
    where: {
      id: userid
    }
  }).then(function (user) {
    if (!user) {
      return callback(null, null)
    }

    models.Note.findAll().then((notes) => {

      let workspaceNotes = [];

      notes.forEach((note) => {
        const noteInfo = models.Note.parseNoteInfo(note.content)

        workspaceNotes.push({
          id: models.Note.encodeNoteId(note.id),
          title: noteInfo.title,
          shortid: note.shortid,
          permission: note.permission,
          updatedAt: note.updatedAt.getTime(),
          ownerId: note.ownerId,
          tags: noteInfo.tags
        })
      })

      logger.debug(`read workspaceNotes success`)
      return callback(null, workspaceNotes)
    })
  }).catch(function (err) {
    logger.error('read history failed: ' + err)
    return callback(err, null)
  })
}

function parseNotesToArray(note) {
  var _note = []
  Object.keys(note).forEach(function (key) {
    var item = note[key]
    _note.push(item)
  })
  return _note
}

function parseNotesToObject(note) {
  var _note = {}
  for (var i = 0, l = note.length; i < l; i++) {
    var item = note[i]
    _note[item.id] = item
  }
  return _note
}

function workspaceGet(req, res) {
  if (req.isAuthenticated()) {
    getWorkspaceNotes(req.user.id, function (err, note) {
      if (err) return errors.errorInternalError(res)
      if (!note) return errors.errorNotFound(res)
      res.send({
        notes: parseNotesToArray(note)
      })
    })
  } else {
    return errors.errorForbidden(res)
  }
}

module.exports = Note
