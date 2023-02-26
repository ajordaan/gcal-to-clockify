import Setup from "./setup.js"

const howlerProjectTasks = [
	{
		"id": "635bdc7a046c243d2ea6cfd5",
		"name": "Maintenance",
		"projectId": "632835b815e8e969ad37c0c4",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "635bdc6cbe208c7ada2a6fc3",
		"name": "DevOps",
		"projectId": "632835b815e8e969ad37c0c4",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "635bdc699264db257e9f1a28",
		"name": "Development",
		"projectId": "632835b815e8e969ad37c0c4",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "635bdc66046c243d2ea6cdd8",
		"name": "Client Meeting",
		"projectId": "632835b815e8e969ad37c0c4",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "635bdc63be208c7ada2a6ec2",
		"name": "Ceremony",
		"projectId": "632835b815e8e969ad37c0c4",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	}
]

const p45ProjectTasks = [
	{
		"id": "63515a436377717db5d31591",
		"name": "Compassionate Leave",
		"projectId": "635159c5ae317d4d60db7c29",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "63515a314510452adfbb3a1d",
		"name": "Parental Leave",
		"projectId": "635159c5ae317d4d60db7c29",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "63515a2b9cc2917e2fc4176f",
		"name": "Sick Leave",
		"projectId": "635159c5ae317d4d60db7c29",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "63515a286377717db5d312f7",
		"name": "Public Holiday",
		"projectId": "635159c5ae317d4d60db7c29",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	},
	{
		"id": "63515a1fd8923012ea8d0508",
		"name": "Annual Leave",
		"projectId": "635159c5ae317d4d60db7c29",
		"assigneeIds": [],
		"assigneeId": null,
		"userGroupIds": [],
		"estimate": null,
		"status": "ACTIVE",
		"duration": null,
		"billable": true,
		"hourlyRate": null,
		"costRate": null
	}
]

const workspaceProjects = [
	{
		"id": "635fafe9183cb013613529f4",
		"name": "Howler : Additional Team",
		"hourlyRate": null,
		"clientId": "63282ddc539caa0e3dcdaf1b",
		"workspaceId": "61c04d29f526e061858f97c6",
		"billable": true,
		"memberships": [
		],
		"color": "#fb04d0",
		"estimate": null,
		"archived": false,
		"duration": null,
		"clientName": "Howler",
		"note": "",
		"costRate": null,
		"timeEstimate": null,
		"budgetEstimate": null,
		"template": false,
		"public": false,
    "tasks": howlerProjectTasks
	},
	{
		"id": "635159c5ae317d4d60db7c29",
		"name": "P45 : Leave",
		"hourlyRate": null,
		"clientId": "63284cbf539caa0e3dd05bfb",
		"workspaceId": "61c04d29f526e061858f97c6",
		"billable": false,
		"memberships": [
		],
		"color": "#ff0000",
		"estimate": null,
		"archived": false,
		"duration": null,
		"clientName": "Platform45",
		"note": "",
		"costRate": null,
		"timeEstimate": null,
		"budgetEstimate": null,
		"template": false,
		"public": true,
    "tasks": p45ProjectTasks
	}
]; 


(async () => {

  const setup = new Setup()
  const activeTasks = await setup.saveClockifyTasks(workspaceProjects)

  console.log({activeTasks})
})();



