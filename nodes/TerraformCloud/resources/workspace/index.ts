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
				name: 'Create Workspace',
				value: 'create',
				action: 'Create a workspace',
				description: 'Create a new workspace in an organization',
			},
			{
				name: 'Delete Workspace',
				value: 'delete',
				action: 'Delete a workspace',
				description: 'Delete a workspace by ID',
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
				name: 'Update Workspace',
				value: 'update',
				action: 'Update a workspace',
				description: 'Update workspace settings by ID',
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
				operation: ['list', 'create'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Workspace name (slug) to create',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Update Name',
		name: 'updateName',
		type: 'string',
		default: '',
		description: 'New workspace name (slug)',
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['update'],
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
				operation: ['get', 'getState', 'update', 'delete'],
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
		name: 'listOptions',
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
	{
		displayName: 'Options',
		name: 'workspaceOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				...showOnlyForWorkspaces,
				operation: ['create', 'update'],
			},
		},
		options: [
			{
				displayName: 'Agent Pool ID',
				name: 'agentPoolId',
				type: 'string',
				default: '',
				description: 'Required when execution mode is agent',
			},
			{
				displayName: 'Auto Apply (API, UI, & VCS Runs)',
				name: 'autoApply',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically apply successful plans for API, UI, and VCS runs',
			},
			{
				displayName: 'Auto Apply Run Triggers',
				name: 'autoApplyRunTrigger',
				type: 'boolean',
				default: false,
				description: 'Whether to automatically apply successful plans for run triggers',
			},
			{
				displayName: 'Automatic Run Triggering',
				name: 'automaticRunTriggering',
				type: 'options',
				options: [
					{
						name: 'Only When Files in Specified Paths Change (Default)',
						value: 'fileChanges',
					},
					{
						name: 'Always (Any VCS Push)',
						value: 'always',
					},
				],
				default: 'fileChanges',
				description: 'Controls whether VCS pushes always trigger runs or only when matching paths change',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Workspace description',
			},
			{
				displayName: 'Execution Mode',
				name: 'executionMode',
				type: 'options',
				options: [
					{
						name: 'Remote',
						value: 'remote',
					},
					{
						name: 'Local',
						value: 'local',
					},
					{
						name: 'Agent',
						value: 'agent',
					},
				],
				default: 'remote',
				description: 'How runs are executed',
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				description: 'Project ID to attach the workspace to',
			},
			{
				displayName: 'Queue All Runs',
				name: 'queueAllRuns',
				type: 'boolean',
				default: false,
				description: 'Whether to queue VCS runs immediately after workspace creation',
			},
			{
				displayName: 'Remote State Sharing (Org Wide)',
				name: 'globalRemoteState',
				type: 'boolean',
				default: false,
				description: 'Whether to allow all workspaces in the organization to access this workspace state',
			},
			{
				displayName: 'Speculative Enabled',
				name: 'speculativeEnabled',
				type: 'boolean',
				default: true,
				description: 'Whether to allow speculative plans on pull requests',
			},
			{
				displayName: 'Tag Names',
				name: 'tagNames',
				type: 'string',
				default: '',
				description: 'Comma-separated workspace tags',
			},
			{
				displayName: 'Terraform Version',
				name: 'terraformVersion',
				type: 'string',
				default: '',
				description: 'Terraform version to use',
			},
			{
				displayName: 'Trigger Patterns',
				name: 'triggerPatterns',
				type: 'string',
				default: '',
				description: 'Comma-separated list of glob patterns appended to repo root',
			},
			{
				displayName: 'Trigger Prefixes',
				name: 'triggerPrefixes',
				type: 'string',
				default: '',
				description: 'Comma-separated list of trigger prefixes appended to repo root',
			},
			{
				displayName: 'Variables',
				name: 'variables',
				type: 'fixedCollection',
				placeholder: 'Add Variable',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'variable',
						displayName: 'Variable',
						values: [
							{
								displayName: 'Category',
								name: 'category',
								type: 'options',
								options: [
									{
										name: 'Terraform',
										value: 'terraform',
									},
									{
										name: 'Environment',
										value: 'env',
									},
								],
								default: 'terraform',
								description: 'Variable category',
							},
							{
								displayName: 'Description',
								name: 'description',
								type: 'string',
								default: '',
								description: 'Optional variable description',
							},
							{
								displayName: 'HCL',
								name: 'hcl',
								type: 'boolean',
								default: false,
								description: 'Whether the value is HCL (for Terraform variables)',
							},
							{
								displayName: 'Key',
								name: 'key',
								type: 'string',
								default: '',
								description: 'Variable key',
							},
							{
								displayName: 'Sensitive',
								name: 'sensitive',
								type: 'boolean',
								default: false,
								description: 'Whether the value is sensitive',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Variable value',
								typeOptions: {
									password: true,
								},
							},
						],
					},
				],
			},
			{
				displayName: 'VCS Repo',
				name: 'vcsRepo',
				type: 'collection',
				placeholder: 'Add VCS Repo',
				default: {},
				options: [
					{
						displayName: 'Auth Type',
						name: 'authType',
						type: 'options',
						options: [
							{
								name: 'OAuth Token',
								value: 'oauth',
							},
							{
								name: 'GitHub App',
								value: 'githubApp',
							},
						],
						default: 'oauth',
						description: 'Authentication type for the VCS connection',
					},
					{
						displayName: 'Branch',
						name: 'branch',
						type: 'string',
						default: '',
						description: 'Branch to use',
					},
					{
						displayName: 'Default Branch',
						name: 'defaultBranch',
						type: 'string',
						default: '',
						description: 'Default branch in the repo',
					},
					{
						displayName: 'GitHub App Installation ID',
						name: 'githubAppInstallationId',
						type: 'string',
						default: '',
						description: 'GitHub App installation ID for the VCS connection',
					},
					{
						displayName: 'Identifier',
						name: 'identifier',
						type: 'string',
						default: '',
						description: 'Repo identifier, e.g. org/repo',
					},
					{
						displayName: 'Ingress Submodules',
						name: 'ingressSubmodules',
						type: 'boolean',
						default: false,
						description: 'Whether to ingress submodules',
					},
					{
						displayName: 'OAuth Token ID',
						name: 'oauthTokenId',
						type: 'string',
						default: '',
						description: 'OAuth token ID for the VCS connection',
						typeOptions: {
							password: true,
						},
					},
					{
						displayName: 'Tags Regex',
						name: 'tagsRegex',
						type: 'string',
						default: '',
						description: 'Regex used to match Git tags for VCS triggers',
					},
				],
			},
			{
				displayName: 'Working Directory',
				name: 'workingDirectory',
				type: 'string',
				default: '',
				description: 'Relative path to Terraform configuration',
			},
		],
	},
];
