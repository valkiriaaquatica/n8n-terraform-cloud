import type { INodeProperties } from 'n8n-workflow';

const showOnlyForGithubAppInstallations = {
	resource: ['githubAppInstallation'],
};

export const githubAppInstallationDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForGithubAppInstallations,
		},
		options: [
			{
				name: 'List Installations',
				value: 'list',
				action: 'List GitHub App installations',
				description: 'List GitHub App installations for an organization',
				routing: {
					request: {
						method: 'GET',
						url: '=/organizations/{{$parameter.organization}}/github-app-installations',
					},
				},
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
			show: showOnlyForGithubAppInstallations,
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
				...showOnlyForGithubAppInstallations,
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
