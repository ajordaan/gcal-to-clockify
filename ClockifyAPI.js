import * as dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

import got from 'got';

export class ClockifyAPI {
  constructor(apiKey, clockifyUserId) {
    this.clockifyUserId = clockifyUserId
    this.API_KEY = apiKey

    const options = {
      prefixUrl: 'https://api.clockify.me/api/v1',
      headers: {
        'X-Api-Key': API_KEY
      },
      timeout: {
        request: 10000
      }
    }

    this.client = got.extend(options)
  }

  async addTimeEntry(task, start, end) {
    const url = `workspaces/${task.workspaceId}/time-entries`
    const options = {
      json: {
        projectId: task.projectId,
        taskId: task.id,
        start,
        end
      }
    }
    const res = await this.client.post(url, options)

    return res.statusCode
  }

  async addTimeEntryFor(taskType, start, end) {
    return addTimeEntry(CLOCKIFY_TASKS[taskType], start, end)
  }

  async getProjectTasks(workspaceId, projectId) {
    const url = `/workspaces/${workspaceId}/projects/${projectId}/tasks`

    const res = await client.get(url)
    return JSON.parse(res.body)
  }

  async getTimeEntries(workspaceId, startTime, endTime) {

    const url = `workspaces/${workspaceId}/user/${this.clockifyUserId}/time-entries?start=${startTime}&end=${endTime}`

    const res = await client.get(url)
    return JSON.parse(res.body)
  }

  async getTimeEntriesForToday(taskId, projectId, workspaceId) {
    const today = new Date()
    const startDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_START_TIME}`
    const endDate = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()} ${DAY_END_TIME}`

    return getTimeEntries(taskId, projectId, workspaceId, startDate, endDate)
  }

  // CLOCKIFY_TASKS = JSON.parse(fs.readFileSync('config/clockify-tasks.json'))
}


