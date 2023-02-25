import * as dotenv from 'dotenv'
import fs from 'fs'
dotenv.config()

import got from 'got';

export default class ClockifyAPI {
  constructor(apiKey) {
    this.API_KEY = apiKey
    this.userInfo = null

    const options = {
      prefixUrl: 'https://api.clockify.me/api/v1',
      headers: {
        'X-Api-Key': this.API_KEY
      },
      timeout: {
        request: 10000
      }
    }
    this.client = got.extend(options)
  }

  async getUserInfo() {
    if(!this.userInfo) {
      const url = `user`
      const res = await this.client.get(url)
      this.userInfo = JSON.parse(res.body)
    }
    return this.userInfo
  }

  async userId() {
    const userInfo = await this.getUserInfo()

    return userInfo.id
  }

  async workspaceId() {
    const userInfo = await this.getUserInfo()

    return userInfo.defaultWorkspace || userInfo.activeWorkspace
  }

  async addTimeEntry(task, start, end) {
    const wId = await this.workspaceId()

    const url = `workspaces/${wId}/time-entries`
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
    // console.log('test add time entry')
    // console.log({taskId: task.id, taskName: task.name, projectId: task.projectId, start, end})
    // return `test time entry submission: ${task.name}`
  }

  async getWorkspaceProjects() {
    const wId = await this.workspaceId()
    const url = `workspaces/${wId}/projects`

    const res = await this.client.get(url)

    return JSON.parse(res.body)
  }

  async getProjectTasks(projectId) {
    const wId = await this.workspaceId()

    const url = `workspaces/${wId}/projects/${projectId}/tasks`

    const res = await this.client.get(url)
    const tasks = JSON.parse(res.body)

    return tasks.map(task => { return { workspaceId: wId, ...task } })
  }

  async getAllProjectsWithTasks() {
    const projects = await this.getWorkspaceProjects()
    for(const project of projects) {
      project.tasks = await this.getProjectTasks(project.id)
    }

    return projects
  }

  async getTimeEntries(startTime, endTime) {
    return []

    const wId = await this.workspaceId()
    const uId = await this.userId()

    const url = `workspaces/${wId}/user/${uId}/time-entries?start=${startTime}&end=${endTime}`

    const res = await this.client.get(url)
    return JSON.parse(res.body)
  }
}


