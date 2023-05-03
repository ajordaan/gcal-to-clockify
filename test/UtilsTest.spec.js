import { convertTimeIntervalToDate, getGapsInClockifySchedule, getGapsInCalendarSchedule } from '../Utils'

describe('Utils', () => {

  const WORK_DAY_START_TIME = '09:00'
  const WORK_DAY_END_TIME = '17:00'

  test('getGapsInCalendarSchedule', () => {
    const d = new Date('2022-01-01')
    const workDay = {
      start: new Date(`2022-01-01 ${WORK_DAY_START_TIME}`),
      end: new Date(`2022-01-01 ${WORK_DAY_END_TIME}`)
    }
    let timeEntries = [{ start: { dateTime:  "2022-01-01 11:00"}, end: { dateTime: '2022-01-01 12:00'  }}, { start: { dateTime: '2022-01-01 14:00'}, end: { dateTime: '2022-01-01 16:00' }}]

    let gaps = getGapsInCalendarSchedule(timeEntries, workDay)

    expect(gaps.length).toBe(3)

    expect(gaps).toStrictEqual([{ start: new Date('2022-01-01 09:00'), end: new Date('2022-01-01 11:00') }, { start: new Date('2022-01-01 12:00'), end: new Date('2022-01-01 14:00') }, { start: new Date('2022-01-01 16:00'), end: new Date('2022-01-01 17:00' )}])


     timeEntries = [{ start: { dateTime:  "2022-01-01 10:30"}, end: { dateTime: '2022-01-01 11:00'}}]

     gaps = getGapsInCalendarSchedule(timeEntries, workDay)

    expect(gaps.length).toBe(2)

    expect(gaps).toStrictEqual([{ start: new Date('2022-01-01 09:00'), end: new Date('2022-01-01 10:30') }, { start: new Date('2022-01-01 11:00'), end: new Date('2022-01-01 17:00' )}])
  })

 test('getGapsInSchedule', () => {
    const d = new Date('2022-01-01')
    const workDay = {
      start: new Date(`2022-01-01 ${WORK_DAY_START_TIME}`),
      end: new Date(`2022-01-01 ${WORK_DAY_END_TIME}`)
    }
    const timeEntries = [{ timeInterval: { start: "2022-01-01 11:00", end: '2022-01-01 12:00' } }, { timeInterval: { start: '2022-01-01 14:00', end: '2022-01-01 16:00' } }]

    const gaps = getGapsInClockifySchedule(timeEntries, workDay)

    expect(gaps.length).toBe(3)

    expect(gaps).toStrictEqual([{ start: new Date('2022-01-01 09:00'), end: new Date('2022-01-01 11:00') }, { start: new Date('2022-01-01 12:00'), end: new Date('2022-01-01 14:00') }, { start: new Date('2022-01-01 16:00'), end: new Date('2022-01-01 17:00' )}])
  })
})
