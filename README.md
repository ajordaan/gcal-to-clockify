# gcal-to-clockify
Easily create and categorise Clockify time entries based on google calendar events

## Disclaimer

Always double check that the time entries have been added correctly on Clockify!

## Prerequisites
To run this script you will need:
* A clockify API key (Found in your [user settings](https://clockify.me/user/settings))
* A google service account with calendar API enabled (the first half of [this tutorial should help](https://dev.to/megazear7/google-calendar-api-integration-made-easy-2a68))

## Setup
* Clone this repo
* Copy the `example.env` file and rename it to `.env` and replace the placeholder values with your clockify api key and google service account info
* Run the script: `npm start`
* Select the "setup" option in the menu and follow the prompts
* You will be asked to select the tasks you want available from your clockify projects and your workday start and end times

## Clocking in
The script works by fetching events from your calendar, asking you to categorise them into clockify tasks and then saving the categorisation for future use.
* Run the script: `npm start`
* Select "Clock in"
* Enter the date you want to clock in for (leave blank for today's date)
* If there are uncategorised events, then the script will task you what type of task they are. You can also "ignore" events so they won't be considered
* The script will upload the events as time entries with their task types (excluding "ignored" events)
* The script will then upload development time entries in the gaps in your schedule, from the start of your work day to the end

## Limitations
* To fill in the gaps in your schedule, the script looks for a task with the name "Development". 
  This won't work for users who work on multiple projects. You can still categorise your calendar tasks, but the development task will have to be manually changed or disabled.
