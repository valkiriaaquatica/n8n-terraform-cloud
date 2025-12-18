import type { INodeProperties } from 'n8n-workflow';

const showOnlyForRuns = {
	resource: ['run'],
};

export const runDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForRuns,
		},
		options: [
			{
				name: 'Add Run Comment',
				value: 'addComment',
				action: 'Add a comment to a run',
				description: 'Attach a comment to a run',
				routing: {
					request: {
						method: 'POST',
						url: '=/runs/{{$parameter.runId}}/comments',
						body: {
							data: {
								type: 'comments',
								attributes: {
									body: '={{$parameter.comment}}',
								},
							},
						},
					},
				},
			},
			{
				name: 'Apply Run',
				value: 'apply',
				action: 'Apply a run',
				description: 'Apply a run that is pending/approved',
				routing: {
					request: {
						method: 'POST',
						url: '=/runs/{{$parameter.runId}}/actions/apply',
						body: {
							comment: '={{$parameter.reason || "Applied from n8n"}}',
						},
					},
				},
			},
			{
				name: 'Cancel Run',
				value: 'cancel',
				action: 'Cancel a run',
				description: 'Cancel a running plan/apply',
				routing: {
					request: {
						method: 'POST',
						url: '=/runs/{{$parameter.runId}}/actions/cancel',
						body: {
							comment: '={{$parameter.reason || "Cancelled from n8n"}}',
						},
					},
				},
			},
			{
				name: 'Create Plan (Manual Apply)',
				value: 'createPlanManualApply',
				action: 'Create a plan that waits for manual apply',
				description: 'Start a plan and leave it pending for manual apply/discard',
				routing: {
					request: {
						method: 'POST',
						url: '/runs',
						body: {
							data: {
								type: 'runs',
								attributes: {
									message: '={{$parameter.message}}',
									'auto-apply': false,
								},
								relationships: {
									workspace: {
										data: {
											type: 'workspaces',
											id: '={{$parameter.workspaceId}}',
										},
									},
								},
							},
						},
					},
				},
			},
			{
				name: 'Create Plan Run',
				value: 'createPlan',
				action: 'Create plan only run',
				description: 'Start a plan-only run in a workspace (plan-only flag)',
				routing: {
					request: {
						method: 'POST',
						url: '/runs',
						body: {
							data: {
								type: 'runs',
								attributes: {
									message: '={{$parameter.message}}',
									'plan-only': true,
								},
								relationships: {
									workspace: {
										data: {
											type: 'workspaces',
											id: '={{$parameter.workspaceId}}',
										},
									},
								},
							},
						},
					},
				},
			},
			{
				name: 'Discard Run',
				value: 'discard',
				action: 'Discard a run',
				description: 'Discard a run that is waiting or paused',
				routing: {
					request: {
						method: 'POST',
						url: '=/runs/{{$parameter.runId}}/actions/discard',
						body: {
							comment: '={{$parameter.reason || "Discarded from n8n"}}',
						},
					},
				},
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get run status',
				description: 'Get the status/details of a run',
				routing: {
					request: {
						method: 'GET',
						url: '=/runs/{{$parameter.runId}}',
					},
				},
			},
			{
				name: 'List by Workspace',
				value: 'list',
				action: 'List runs',
				description: 'List runs for a workspace',
				routing: {
					request: {
						method: 'GET',
						url: '=/workspaces/{{$parameter.workspaceId}}/runs',
					},
				},
			},
		],
		default: 'list',
	},
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		required: true,
		default: '',
		description: 'Workspace ID (not name) as required by the API',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['list', 'createPlan', 'createPlanManualApply'],
			},
		},
	},
	{
		displayName: 'Run ID',
		name: 'runId',
		type: 'string',
		required: true,
		default: '',
		description: 'Run ID to operate on',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['getStatus', 'cancel', 'discard', 'apply', 'addComment'],
			},
		},
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		placeholder: 'Plan run started from n8n',
		description: 'Optional message to attach to the run',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['createPlan', 'createPlanManualApply'],
			},
		},
	},
	{
		displayName: 'Reason / Comment',
		name: 'reason',
		type: 'string',
		default: '',
		placeholder: 'Cancelled from n8n',
		description: 'Optional comment for cancel/discard/apply actions',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['cancel', 'discard', 'apply'],
			},
		},
	},
	{
		displayName: 'Run Comment',
		name: 'comment',
		type: 'string',
		default: '',
		placeholder: 'Comment to add to the run',
		description: 'Comment text to post to the run',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['addComment'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		default: {},
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				...showOnlyForRuns,
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Page Number',
				name: 'pageNumber',
				type: 'number',
				default: 1,
				typeOptions: {
					minValue: 1,
				},
				description: 'Page number to return',
				routing: {
					request: {
						qs: {
							'page[number]': '={{$value}}',
						},
					},
				},
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
				description: 'Number of results per page',
				routing: {
					request: {
						qs: {
							'page[size]': '={{$value}}',
						},
					},
				},
			},
		],
	},
];
