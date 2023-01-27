import * as dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

import got from 'got';
const API_KEY = process.env.CLOCKIFY_API_KEY

const options = {
  prefixUrl: 'https://api.clockify.me/api/v1',
  headers: {
    'X-Api-Key': API_KEY
  },
  timeout: {
    request: 10000
  }
}

const USER_ID = process.env.CLOCKIFY_USER_ID

const client = got.extend(options)

export const CLOCKIFY_TASKS = JSON.parse(fs.readFileSync('config/clockify-tasks.json'))

export const addTimeEntryFor = async (taskType, start, end) => {
  return addTimeEntry(CLOCKIFY_TASKS[taskType], start, end)
}

export const addTimeEntry = async (task, start, end) => {
  const url = `workspaces/${task.workspaceId}/time-entries`
  const options = {
    json: {
      projectId: task.projectId,
      taskId: task.id,
      start,
      end
    }
  }
  const res = await client.post(url, options)

  return res.statusCode
}

export const getTimeEntries = async (workspaceId, startTime, endTime) => {

  const url = `workspaces/${workspaceId}/user/${USER_ID}/time-entries?start=${startTime}&end=${endTime}`

  const res = await client.get(url)
  return JSON.parse(res.body)
}

export const getTimeEntriesForToday = async (taskId, projectId, workspaceId) => {
  const today = new Date()
  const startDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_START_TIME}`
  const endDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_END_TIME}`

  return getTimeEntries(taskId, projectId, workspaceId, startDate, endDate)
}
