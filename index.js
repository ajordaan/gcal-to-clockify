import { getEvents } from './GoogleCalendarAPI.js';
import { addTimeEntryFor, getTimeEntries, CLOCKIFY_TASKS } from './ClockifyAPI.js'
import fs from 'fs'
import prompts from 'prompts';
import { getGapsInCalendarSchedule, timeInHoursMinutes, WORK_DAY_END_TIME, WORK_DAY_START_TIME, title } from './Utils.js'

(async () => {
  console.log(title)
  const questions = [
    {
      type: 'select',
      name: 'action',
      message: 'Choose an action',
      choices: [
        { title: 'Clock In', value: 'clock-in' },
        { title: 'Add custom time entry', value: 'custom-entry' },
        { title: 'Setup', value: 'setup' }
      ]
    },
    {
      type: prev => prev == 'clock-in' ? 'text' : null,
      name: 'clockInDate',
      message: 'Enter clock-in date (YYYY-MM-DD). Leave blank for today\'s date'
    }
  ]
  const response = await prompts(questions);

  switch (response.action) {
    case 'clock-in':
      const date = response.clockInDate ? new Date(response.clockInDate) : new Date()
      const projectId = '61c04d29f526e061858f97c6'
      updateClockify(date)
  }
})();

