
import * as dotenv from 'dotenv' 
dotenv.config()

import { google } from 'googleapis';
import { currentWorkDay } from './Utils.js';

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const GOOGLE_PROJECT_NUMBER = process.env.GOOGLE_PROJECT_NUMBER
const GOOGLE_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID

const DAY_START_TIME = '07:00'
const DAY_END_TIME = '19:00'

const WORK_DAY_START_TIME = '09:00'
const WORK_DAY_END_TIME = '17:00'


const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  SCOPES
);

export const calendar = google.calendar({
  version: 'v3',
  project: GOOGLE_PROJECT_NUMBER,
  auth: jwtClient
});


export const getEvents = async (fromTime, untilTime, onlyAcceptedEvents = true) => {
  const eventsRes = await calendar.events.list({
    calendarId: GOOGLE_CALENDAR_ID,
    timeMin: fromTime.toISOString(),
    timeMax: untilTime.toISOString(),
    maxAttendees: 1,
    maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime',
  });
  if(onlyAcceptedEvents) {
    return eventsRes.data.items.filter(event => event.attendees[0].responseStatus == 'accepted' )
  }
  
  return eventsRes.data.items
}

export const getEventsForToday = (onlyAcceptedEvents = true) => {

  const workDay = currentWorkDay()

  return getEvents(workDay.start, workDay.end, onlyAcceptedEvents)
}
