import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TerraformCloudApi implements ICredentialType {
	name = 'terraformCloudApi';

	displayName = 'Terraform Cloud API';

	icon: Icon = {
		light: 'file:../nodes/TerraformCloud/terraformCloud.svg',
		dark: 'file:../nodes/TerraformCloud/terraformCloud.dark.svg',
	};

	documentationUrl = 'https://developer.hashicorp.com/terraform/cloud-docs/api-docs';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.terraform.io/api/v2',
			url: '/account/details',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.api+json',
			},
		},
	};
}
