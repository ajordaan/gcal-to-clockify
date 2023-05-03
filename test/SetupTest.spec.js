import nock from 'nock'
import prompts from 'prompts'

import {jest} from '@jest/globals'
import Setup from '../setup'

nock.disableNetConnect()

describe('Setup', () => {

  const WORK_DAY_START_TIME = '09:00'
  const WORK_DAY_END_TIME = '17:00'

  const clockifyUserInfoStub = {
    "id": "id123",
    "email": "email@example.com",
    "name": "Andrew Jordaan",
    "activeWorkspace": "aws123",
    "defaultWorkspace": "dws123",
  }

  const clockifyConfigStub = {
    "activeTasks":[{"id":"task1","projectId":"project1","name":"Support","projectName":"My Project","workspaceId":"dws123"},{"id":"task2","projectId":"project1","name":"Client Meeting","projectName":"My Project","workspaceId":"dws123"},{"id":"task3","projectId":"project1","name":"Development","projectName":"My Project","workspaceId":"dws123"}],
    "workDay":{"startTime":"09:00","endTime":"17:00"},
    "fillInGaps":true,
    "fillTask": "task3"
  }

  test('Run Setup', async() => {
    const clockify = nock('https://api.clockify.me/api/v1')
    clockify.get('/user').reply(200, clockifyUserInfoStub)
    clockify.get(uri => uri.includes('/time-entries?')).reply(200, [])
    clockify.post(`/workspaces/${clockifyUserInfoStub.defaultWorkspace}/time-entries`).thrice().reply(200)

    clockify.get('/workspaces/dws123/projects').reply(200, [{id: 'project1', name: 'My Project' }])
    clockify.get('/workspaces/dws123/projects/project1/tasks').reply(200, clockifyConfigStub.activeTasks)

    prompts.inject([ clockifyConfigStub.activeTasks, '09:00', '17:00', true, 'task3']);

    const setup = new Setup('clockify_api_key', { GOOGLE_PRIVATE_KEY: '', GOOGLE_CLIENT_EMAIL: '', GOOGLE_PROJECT_NUMBER: '', GOOGLE_CALENDAR_ID: '' }, prompts)

    const logSpy = jest.spyOn(console, 'log');

    jest.spyOn(Setup.prototype, 'updateConfig').mockReturnValue(true);

    await setup.runSetup()

    expect(logSpy).toHaveBeenCalledWith('Setup complete!')
    expect(Setup.prototype.updateConfig).toHaveBeenCalledWith(clockifyConfigStub);

  })

})
