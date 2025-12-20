import type { INodeProperties } from 'n8n-workflow';

const showOnlyForWorkspaces = {
	resource: ['workspace'],
};

export const workspaceDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForWorkspaces,
		},
		options: [
			{
				name: 'List Workspaces',
				value: 'list',
				action: 'List workspaces',
				description: 'List workspaces in an organization',
				routing: {
					request: {
						method: 'GET',
						url: '=/organizations/{{$parameter.organization}}/workspaces',
					},
				},
			},
			{
				name: 'Get Workspace Details',
				value: 'get',
				action: 'Get workspace details',
				description: 'Fetch workspace info including VCS settings',
				routing: {
					request: {
						method: 'GET',
						url: '=/workspaces/{{$parameter.workspaceId}}',
						qs: {
							include: 'current_run,latest_run',
						},
					},
				},
			},
			{
				name: 'Get Workspace State',
				value: 'getState',
				action: 'Get workspace state metadata',
				description: 'Fetch the latest state version metadata (and download URL)',
			},
		],
		default: 'list',
	},
	{
		displayName: 'Organization',
		name: 'organization',
		type: 'string',
		default: '',
		required: true,
		description: 'Terraform Cloud organization name',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['list'],
			},
		},
	},
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		default: '',
		required: true,
		description: 'Workspace ID (not name) required for workspace details',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['get', 'getState'],
			},
			hide: {
				resolveByName: [true],
			},
		},
	},
	{
		displayName: 'Resolve Workspace by Name',
		name: 'resolveByName',
		type: 'boolean',
		default: false,
		description: 'Whether to use organization + workspace name instead of workspace ID',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['getState'],
			},
		},
	},
	{
		displayName: 'Workspace Name',
		name: 'workspaceName',
		type: 'string',
		default: '',
		required: true,
		description: 'Workspace name (slug) within the organization',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['getState'],
				resolveByName: [true],
			},
		},
	},
	{
		displayName: 'Organization',
		name: 'stateOrganization',
		type: 'string',
		default: '',
		required: true,
		description: 'Terraform Cloud organization name (only when resolving by name)',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['getState'],
				resolveByName: [true],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
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
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Search workspaces by name',
				routing: {
					request: {
						qs: {
							'search[generic]': '={{$value}}',
						},
					},
				},
			},
		],
	},
];
