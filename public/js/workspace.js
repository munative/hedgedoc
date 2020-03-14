import LZString from 'lz-string'
import S from 'string'

import {
  checkNoteIdValid,
  encodeNoteId
} from './utils'

export function parseToWorkspaceNotes(list, workspaceNotes, callback) {
  if (!callback) return
  else if (!list || !workspaceNotes) callback(list, workspaceNotes)
  else if (workspaceNotes && workspaceNotes.length > 0) {
    for (let i = 0; i < workspaceNotes.length; i++) {
      // migrate LZString encoded id to base64url encoded id
      try {
        let id = LZString.decompressFromBase64(workspaceNotes[i].id)
        if (id && checkNoteIdValid(id)) {
          workspaceNotes[i].id = encodeNoteId(id)
        }
      } catch (err) {
        console.error(err)
      }
      // parse time to timestamp and fromNow
      const timestamp = (typeof workspaceNotes[i].updatedAt === 'number' ? moment(workspaceNotes[i].updatedAt) : moment(workspaceNotes[i].updatedAt, 'MMMM Do YYYY, h:mm:ss a'))
      workspaceNotes[i].timestamp = timestamp.valueOf()
      workspaceNotes[i].updatedAt = timestamp.format('llll')
      // prevent XSS
      workspaceNotes[i].tags = (workspaceNotes[i].tags && workspaceNotes[i].tags.length > 0) ? S(workspaceNotes[i].tags).escapeHTML().s.split(',') : []
      // add to list
      if (workspaceNotes[i].id && list.get('id', workspaceNotes[i].id).length === 0) { list.add(workspaceNotes[i]) }
    }
  }
  callback(list, workspaceNotes)
}

export function getWorkspaceNotes(list, callback) {
  $.get(`${serverurl}/workspace`)
    .done(data => {
      if (data.notes) {
        callback(list, data.notes)
      }
    })
    .fail((xhr, status, error) => {
      console.error(xhr.responseText)
    })
}