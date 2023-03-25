export const WORK_DAY_START_TIME = '09:00'
export const WORK_DAY_END_TIME = '17:00'

export const currentWorkDay = () => {
  const today = new Date()
  const workDay = {
    start: new Date(`${today.toISOString().split('T')[0]} ${WORK_DAY_START_TIME}`),
    end: new Date(`${today.toISOString().split('T')[0]} ${WORK_DAY_END_TIME}`)
  }

  return workDay
}

export const timeInHoursMinutes = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`

export const convertTimeIntervalToDate = (timeInterval) => {
  return { start: new Date(timeInterval.start), end: new Date(timeInterval.end) }
}

export const combineTimeAndDate = (startTime, endTime, date) => {
  return {
    start: new Date(`${date.toISOString().split('T')[0]} ${startTime}`),
    end: new Date(`${date.toISOString().split('T')[0]} ${endTime}`)
  }
}

export const getGapsInCalendarSchedule = (events, workDay) => {
  const gaps = []

  events.forEach(event => event.timeInterval = convertTimeIntervalToDate({ start: event.start.dateTime, end: event.end.dateTime }))

  const sortedevents = events.sort((a, b) => a.timeInterval.start.getTime() - b.timeInterval.start.getTime());
  if (sortedevents[0].timeInterval.start.getTime() > workDay.start.getTime()) {
    gaps.push({ start: workDay.start, end: sortedevents[0].timeInterval.start })
  }

  for (let i = 1; i < events.length; i++) {
    if (events[i - 1].timeInterval.end.getTime() < events[i].timeInterval.start.getTime()) {
      gaps.push({ start: events[i - 1].timeInterval.end, end: events[i].timeInterval.start })
    }
  }

  const lastTimeEntry = events[events.length - 1]

  if (lastTimeEntry.timeInterval.end.getTime() < workDay.end) {
    gaps.push({ start: lastTimeEntry.timeInterval.end, end: workDay.end })
  }

  return gaps
}
export const getGapsInClockifySchedule = (timeEntries, workDay) => {
  const gaps = []

  timeEntries.forEach(timeEntry => timeEntry.timeInterval = convertTimeIntervalToDate(timeEntry.timeInterval))

  const sortedTimeEntries = timeEntries.sort((a, b) => a.timeInterval.start.getTime() - b.timeInterval.start.getTime());
  if (sortedTimeEntries[0].timeInterval.start.getTime() > workDay.start.getTime()) {
    gaps.push({ start: workDay.start, end: sortedTimeEntries[0].timeInterval.start })
  }

  for (let i = 1; i < timeEntries.length; i++) {
    if (timeEntries[i - 1].timeInterval.end.getTime() < timeEntries[i].timeInterval.start.getTime()) {
      gaps.push({ start: timeEntries[i - 1].timeInterval.end, end: timeEntries[i].timeInterval.start })
    }
  }

  const lastTimeEntry = timeEntries[timeEntries.length - 1]

  if (lastTimeEntry.timeInterval.end.getTime() < workDay.end) {
    gaps.push({ start: lastTimeEntry.timeInterval.end, end: workDay.end })
  }

  return gaps
}

import fs from 'fs'
export const title = fs.readFileSync('./ascii-title.txt').toString()
