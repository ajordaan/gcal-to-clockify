import * as dotenv from 'dotenv' 
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

const CLOCKIFY_TASKS = {
  development: {
    "id": "635bdc699264db257e9f1a28",
    "name": "Development",
    "projectId": "632835b815e8e969ad37c0c4",
    "workspaceId": "61c04d29f526e061858f97c6"
  },
  clentMeeting: {
    "id": "635bdc66046c243d2ea6cdd8",
    "name": "Client Meeting",
    "projectId": "632835b815e8e969ad37c0c4",
    "workspaceId": "61c04d29f526e061858f97c6"
  },
  ceremony: {
    "id": "635bdc63be208c7ada2a6ec2",
    "name": "Ceremony",
    "projectId": "632835b815e8e969ad37c0c4",
    "workspaceId": "61c04d29f526e061858f97c6"
  },
  sickLeave: {
    "id": "63515a2b9cc2917e2fc4176f",
    "name": "Sick Leave",
    "projectId": "635159c5ae317d4d60db7c29",
    "workspaceId": "61c04d29f526e061858f97c6"
  },
  publicHoliday: {
    "id": "63515a286377717db5d312f7",
    "name": "Public Holiday",
    "projectId": "635159c5ae317d4d60db7c29",
    "workspaceId": "61c04d29f526e061858f97c6"
  },
  annualLeave: {
    "id": "63515a1fd8923012ea8d0508",
    "name": "Annual Leave",
    "projectId": "635159c5ae317d4d60db7c29",
    "workspaceId": "61c04d29f526e061858f97c6"
  }
}

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
