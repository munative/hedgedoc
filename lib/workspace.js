'use strict'

const logger = require('./logger')
const models = require('./models')
const errors = require('./errors')
const { checkViewPermission } = require('./web/note/util')

function getWorkspaceNotes (req, callback) {
  models.Note.findAll().then((notes) => {
    const workspaceNotes = notes.filter((note) => {
      return checkViewPermission(req, note)
    }).map((note) => {
      const noteInfo = models.Note.parseNoteInfo(note.content)

      return {
        id: models.Note.encodeNoteId(note.id),
        title: noteInfo.title,
        shortid: note.shortid,
        permission: note.permission,
        updatedAt: note.updatedAt.getTime(),
        ownerId: note.ownerId,
        tags: noteInfo.tags
      }
    })

    logger.debug('read workspaceNotes success')
    return callback(null, workspaceNotes)
  })
}

function parseNotesToArray (note) {
  const _note = []
  Object.keys(note).forEach(function (key) {
    const item = note[key]
    _note.push(item)
  })
  return _note
}

function workspaceGet (req, res) {
  if (req.isAuthenticated()) {
    getWorkspaceNotes(req, function (err, note) {
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

module.exports = {
  workspaceGet
}
