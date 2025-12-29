import type { INodeProperties } from 'n8n-workflow';

const showOnlyForVariables = {
	resource: ['variable'],
};

export const variableDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForVariables,
		},
		options: [
			{
				name: 'Create Variable',
				value: 'create',
				action: 'Create a variable',
				description: 'Create a variable in a workspace',
				routing: {
					request: {
						method: 'POST',
						url: '=/workspaces/{{$parameter.workspaceId}}/vars',
					},
				},
			},
			{
				name: 'Update Variable',
				value: 'update',
				action: 'Update a variable',
				description: 'Update a variable by ID',
				routing: {
					request: {
						method: 'PATCH',
						url: '=/vars/{{$parameter.variableId}}',
					},
				},
			},
			{
				name: 'Delete Variable',
				value: 'delete',
				action: 'Delete a variable',
				description: 'Delete a variable by ID',
				routing: {
					request: {
						method: 'DELETE',
						url: '=/vars/{{$parameter.variableId}}',
					},
				},
			},
		],
		default: 'create',
	},
	{
		displayName: 'Workspace ID',
		name: 'workspaceId',
		type: 'string',
		default: '',
		required: true,
		description: 'Workspace ID where the variable will be created',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Variable ID',
		name: 'variableId',
		type: 'string',
		default: '',
		required: true,
		description: 'Variable ID to update or delete',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['update', 'delete'],
			},
		},
	},
	{
		displayName: 'Key',
		name: 'key',
		type: 'string',
		default: '',
		required: true,
		description: 'Variable key',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Value',
		name: 'value',
		type: 'string',
		default: '',
		required: true,
		description: 'Variable value',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
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
		required: true,
		description: 'Variable category',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Sensitive',
		name: 'sensitive',
		type: 'boolean',
		default: false,
		description: 'Whether the value is sensitive',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'HCL',
		name: 'hcl',
		type: 'boolean',
		default: false,
		description: 'Whether the value is HCL (for Terraform variables)',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Optional variable description',
		displayOptions: {
			show: {
				...showOnlyForVariables,
				operation: ['create', 'update'],
			},
		},
	},
];
