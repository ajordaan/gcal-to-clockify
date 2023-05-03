import nock from 'nock'
import ClockifyUpdater from '../ClockifyUpdater'
import { mainMenu } from '../menu'
import prompts from 'prompts'

import {jest} from '@jest/globals'
import GoogleCalendarAPI from '../GoogleCalendarAPI'
import ClockifyAPI from '../ClockifyAPI'
nock.disableNetConnect()

describe('ClockifyUpdater', () => {

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
    "fillInGaps":true
  }

  const privateKeyStub = "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCUAtG67iszY2iS\njGpqNzziIDGvsoMPsKHBQ1DGz1EWAlsT5n8WL0bjlftLBu5fMXN2eKLhN/cGXaQg\nYn00E6M8uMN92zAjSNY5rEwhNbYTumTcGTrC1IUMhbr2OKpNIghRZJP3DIUk5ro0\nx1syZGKwKLhn5whKsUfcN/q44PGLQvMzrJGswqesjiM9rwvMCN4Tj75RT69R9z8p\n3l90JIuozNb50LYO48DW1Kw44FByGBXyIP8Yhct8KGU75aPW3Bw1ypfD6qp13D3/\nr2qeHBqBTJKOBezTzcRpccVl4SiHOStFeWyTzOzGTH9QUH+ARJpIb+AaPMtP10tE\nDQzmY0/9AgMBAAECggEALblpPUxSgD+XkJ5cSY/i+SBk+Rg2sOQqNGAtVh25uQjl\nRhKQ9DOKvMgap6Tugu3t8411FAqL/6VyDKcgcrQWW63ghsLt7hiURaDaq+/B3fpZ\nKj2JD6NDrwipJ2N+CPIYi7x8kXeGsk2s/J0RqVGlwzHxNfgDcb+uqXOJuw+SzyhX\nW99FKV+vHf+S5JapIGXrwnSwJC8cziKeKfw/q9bAI5UXnC1dNT6lvoRmTYk9CIjW\nlCd7gkqz9RyQtR0himla7cl3KPhdJ6+WzNx4XchCJVcamD7CkHqD1UxAwCC9/PrM\nMuvYza0kX0wYBlY8WYRRrRmzLYEXioKZc5Py6a6VAQKBgQDpuouTa4HSeSGJjLhQ\nyKRlG2o3Tx/9kKoUgArzGegUjNp34KPoZSHNTrBVQN0o8RCQol7btE6Tw7aEmnIa\n+uq1jnPqKD3G/juVD8Os0xesdX/0WZ0ukuGxXLU5tpKhjFWrFKcOLdZqSPSCwWhH\nSZqJn6JubwrZy3lxupvuqzQHIQKBgQCiHVJx/ofDGRb18XtGA2EU8mADXllBwoXI\n6fqMsikYHqMZ0NyRvvObNUSshalYl72P0besQhKsBtV+L1MHsGJTEMnbegwMnJ2r\nb2LppBB+XM8sSUfbeNKHVKg87iGC7/Qzq39zJClqby0N85q5vyPq3Bis1GMq9Apy\ngenQ5vqZXQKBgQC3T594l7DSKj6rarqEYVjOE5pSlrQ4YuWB/oqX75GdzHrr2juz\nYN4J79VMh/rsyWR8i1xqZBfcvHrBtYAYuQKsMnWnCLirAWoplpuZSFYg5GbedgpZ\nJMnuGQ/pm8+U9EOcUi5TaI/p/B4JDzeB8bBKj/ENO/n+px8wm3MA1TWRAQKBgQCd\nkMZbSbsGo1IvxX+9cvde9pzfaUpzoe+KcfA148wRR2XbZ6eaePApQML4tAj+tK1o\nJbvRz356eUH0HWckKAnJFp47lgo0D90njWGkGPR2/RnXv3n6FRr6sgu6/PDRZQwD\nVILRlKo0as5tqwIN23u7gCTzhpLEYuHsndx2UKnteQKBgQDI8+a1lGlCBDE+LQb3\nvgoeGe69yfRKV39Hf+XVuVhyfDpJwglSHHjxcO3CCmS6MfEj1Uo/e9d7lFJW7m59\nfnV59nxgBGLFlHiLfJIuu8UZDNceacBQYYYDd3Kltf88MspcuLpVq84Q25ygqyWH\ngHMrp2RMvYvmvxu8rLHLOQj4BA==\n-----END PRIVATE KEY-----\n"
  const calendarEventStub = [
    {
      "kind": "calendar#event",
      "status": "confirmed",
      "summary": "Daily Standup",
      "creator": {
        "email": "kerry.hearn@howler.co.za"
      },
      "organizer": {
        "email": "kerry.hearn@howler.co.za"
      },
      "start": {
        "dateTime": `${new Date().toISOString().split('T')[0]} 10:30`,
        "timeZone": "Africa/Johannesburg"
      },
      "end": {
        "dateTime": `${new Date().toISOString().split('T')[0]} 11:30`,
        "timeZone": "Africa/Johannesburg"
      },
      "recurringEventId": "f040qhb792il07nchhl6fhg74s_R20230111T083000",
      "originalStartTime": {
        "dateTime": "2023-01-18T10:30:00+02:00",
        "timeZone": "Africa/Johannesburg"
      },
      "attendees": [
        {
          "email": "andrew.jordaan@platform45.com",
          "self": true,
          "responseStatus": "accepted"
        }
      ],
      "attendeesOmitted": true,
      "reminders": {
        "useDefault": true
      },
      "eventType": "default"
    }
  ]

  const mockSetupClass = (targetDate, prevEvents = {} )=> {
    return {

      setupComplete() {
        return true
      },
      getGoogleCalendarAPI() {
        return new GoogleCalendarAPI(privateKeyStub, 'email@example.com', 'gproject', 'mycalendar')
      },
      getClockifyAPI() {
        return new ClockifyAPI('apikey123')
      },
      getPreviouslyCategorisedEvents() {
        return prevEvents
      },

      saveCategorisedEvents(_) {

      },
      getClockifyConfig() {
        return clockifyConfigStub
      },

      setTargetDate(_) {
      },
      targetDate: targetDate
    }
  }

  const setupTest = (setup, calendarEvents, workDay)=> {
    const instance = new ClockifyUpdater(setup, calendarEvents, workDay)
  }


  test('Update Clockify', async() => {
    const clockify = nock('https://api.clockify.me/api/v1')
    const gcal = nock('https://www.googleapis.com')

    gcal.post('/oauth2/v4/token').reply(200)

    gcal.get(uri => uri.includes('/events')).reply(200, { items: calendarEventStub })

    clockify.get('/user').reply(200, clockifyUserInfoStub)

    clockify.get(uri => uri.includes('/time-entries?')).reply(200, [])

    const clockedIn = clockify.post(`/workspaces/${clockifyUserInfoStub.defaultWorkspace}/time-entries`).thrice().reply(200)
    clockify.post(`/workspaces/${clockifyUserInfoStub.defaultWorkspace}/time-entries`).reply(200)
    prompts.inject([ 'clock-in', '', 'task1']);

    const setup = mockSetupClass(new Date(), )

    const logSpy = jest.spyOn(console, 'log');

    await mainMenu(prompts, setup)

    expect(logSpy).toHaveBeenCalledWith('Added a Support entry for Daily Standup (10:30 - 11:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (09:00 - 10:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (11:30 - 17:00)' )

  })

  test('Update Clockify - with categorised events', async() => {
    const clockify = nock('https://api.clockify.me/api/v1')
    const gcal = nock('https://www.googleapis.com')

    gcal.post('/oauth2/v4/token').reply(200)

    gcal.get(uri => uri.includes('/events')).reply(200, { items: calendarEventStub })

    clockify.get('/user').reply(200, clockifyUserInfoStub)

    clockify.get(uri => uri.includes('/time-entries?')).reply(200, [])

    const clockedIn = clockify.post(`/workspaces/${clockifyUserInfoStub.defaultWorkspace}/time-entries`).thrice().reply(200)
    clockify.post(`/workspaces/${clockifyUserInfoStub.defaultWorkspace}/time-entries`).reply(200)
    prompts.inject([ 'clock-in', '', ]);

    const prevEvents = {'Daily Standup': 'task2'}
    const setup = mockSetupClass(new Date(), prevEvents)

    const logSpy = jest.spyOn(console, 'log');

    await mainMenu(prompts, setup)

    expect(logSpy).toHaveBeenCalledWith('Added a Client Meeting entry for Daily Standup (10:30 - 11:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (09:00 - 10:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (11:30 - 17:00)' )

  })
})
