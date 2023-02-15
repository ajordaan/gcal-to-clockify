import { google } from 'googleapis';
import { currentWorkDay, WORK_DAY_START_TIME, WORK_DAY_END_TIME } from './Utils.js';
export default class GoogleCalendarAPI {
  constructor(privateKey, clientEmail, projectNumber, calendarId) {

    this.SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
    this.GOOGLE_PRIVATE_KEY = privateKey
    this.GOOGLE_CLIENT_EMAIL = clientEmail
    this.GOOGLE_PROJECT_NUMBER = projectNumber
    this.GOOGLE_CALENDAR_ID = calendarId

    this.jwtClient = new google.auth.JWT(
      this.GOOGLE_CLIENT_EMAIL,
      null,
      this.GOOGLE_PRIVATE_KEY,
      this.SCOPES
    );

    this.calendar = google.calendar({
      version: 'v3',
      project: this.GOOGLE_PROJECT_NUMBER,
      auth: this.jwtClient
    });
  }


  async getEvents(fromTime, untilTime, onlyAcceptedEvents = true) {
    const eventsRes = await calendar.events.list({
      calendarId: this.GOOGLE_CALENDAR_ID,
      timeMin: fromTime.toISOString(),
      timeMax: untilTime.toISOString(),
      maxAttendees: 1,
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    if (onlyAcceptedEvents) {
      return eventsRes.data.items.filter(event => event.attendees?.at(0)?.responseStatus === 'accepted')
    }

    return eventsRes.data.items
  }

  async getEventsForToday(onlyAcceptedEvents = true) {
    const workDay = currentWorkDay()
    return getEvents(workDay.start, workDay.end, onlyAcceptedEvents)
  }
}
