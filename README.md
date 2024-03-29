# gcal-to-clockify
Easily create and categorise Clockify time entries based on google calendar events

## Disclaimer
Always double check that the time entries have been added correctly on Clockify!

## Prerequisites
To run this script you will need:
* A clockify API key (Found in your [user settings](https://clockify.me/user/settings))
* A google service account with calendar API enabled (the first two steps of [this tutorial should help](https://dev.to/megazear7/google-calendar-api-integration-made-easy-2a68))
  * Once you have created a service account you will be able to download a JSON file that has all the required credentials for this script

## Setup
* Clone this repo
* Run `npm i`
* Copy the `example.env` file and rename it to `.env` and replace the placeholder values with your clockify api key and google service account info
* Run the script: `npm start`
* Select the "setup" option in the menu and follow the prompts
* You will be asked to select the tasks you want available from your clockify projects, your workday start and end times, and if you want to fill gaps in your schedule with a certain task (e.g Development)

## Clocking in
The script works by fetching events from your calendar, asking you to categorise them into clockify tasks and then saving the categorisation for future use.
* Run the script: `npm start`
* Select "Clock in"
* Enter the date you want to clock in for (leave blank for today's date)
* If there are uncategorised events, you will be asked what type of task they are. You can also "ignore" events so they won't be considered
* The script will upload the events as time entries with their task types (excluding "ignored" events)
* The script will then upload time entries in the gaps in your schedule for the task you selected, from the start of your work day to the end (if you enabled this in the setup)
* the next time you run the script, if it finds an event that was previously categorised then it will automatically assign the clockify task and create a time entry

## Limitations
* Google calendar events must have you as an attendee, or as the creator of the event. Other event types (Like an out of office event) might not work correctly
* The gaps in your schedule are filled with a single task type. This won't work for users who are on multiple projects.
  You can still categorise your calendar tasks, but your schedule gaps will have to be manually filled in.

## TODO
* Add the ability to upload custom time entries
