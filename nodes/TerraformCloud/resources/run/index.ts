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
			},
			{
				name: 'Apply Run',
				value: 'apply',
				action: 'Apply a run',
				description: 'Apply a run that is pending/approved',
			},
			{
				name: 'Cancel Run',
				value: 'cancel',
				action: 'Cancel a run',
				description: 'Cancel a running plan/apply',
			},
			{
				name: 'Create Plan (Manual Apply)',
				value: 'createPlanManualApply',
				action: 'Create a plan that waits for manual apply',
				description: 'Start a plan and leave it pending for manual apply/discard',
			},
			{
				name: 'Create Plan Run',
				value: 'createPlan',
				action: 'Create plan only run',
				description: 'Start a plan-only run in a workspace (plan-only flag)',
			},
			{
				name: 'Discard Run',
				value: 'discard',
				action: 'Discard a run',
				description: 'Discard a run that is waiting or paused',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				action: 'Get run status',
				description: 'Get the status/details of a run',
			},
			{
				name: 'List by Workspace',
				value: 'list',
				action: 'List runs',
				description: 'List runs for a workspace',
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
			},
		],
	},
];
