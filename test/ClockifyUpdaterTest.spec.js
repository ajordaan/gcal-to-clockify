import nock from 'nock'
import ClockifyUpdater from '../ClockifyUpdater'
import { mainMenu } from '../menu'
import prompts from 'prompts'

import {jest} from '@jest/globals'

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

  const mockSetupClass = (activeTasks, prevEvents)=> {
    return {

      getClockifyAPI() {
        return new ClockifyAPI('apikey123')
      },
      getPreviouslyCategorisedEvents() {
        return prevEvents
      },

      saveCategorisedEvents(_) {

      },
      getClockifyConfig() {
        return {
          activeTasks: activeTasks
        }
      }

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
    prompts.inject([ 'clock-in', '']);

    const logSpy = jest.spyOn(console, 'log');

   await mainMenu(prompts)

    expect(logSpy).toHaveBeenCalledWith('Added a Ceremony entry for Daily Standup (10:30 - 11:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (09:00 - 10:30)' )
    expect(logSpy).toHaveBeenCalledWith('Added a Development entry (11:30 - 17:00)' )
    
  })
})
