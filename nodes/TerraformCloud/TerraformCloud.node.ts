import {
    NodeConnectionTypes,
    NodeOperationError,
    type IDataObject,
    type IExecuteFunctions,
    type INodeExecutionData,
    type IHttpRequestMethods,
    type IHttpRequestOptions,
    type INodeType,
    type INodeTypeDescription,
} from 'n8n-workflow';
import { workspaceDescription } from './resources/workspace';
import { runDescription } from './resources/run';
import { projectDescription } from './resources/project';

type FullResponse = {
    statusCode?: number;
    status?: number;
    body?: IDataObject | null;
};

export class TerraformCloud implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Terraform Cloud',
        name: 'terraformCloud',
        icon: { light: 'file:terraformCloud.svg', dark: 'file:terraformCloud.dark.svg' },
        group: ['input'],
        version: 1,
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
        description: 'Interact with the Terraform Cloud API',
        defaults: {
            name: 'Terraform Cloud',
        },
        usableAsTool: true,
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [
            {
                name: 'terraformCloudApi',
                required: true,
            },
        ],
        requestDefaults: {
            baseURL: 'https://app.terraform.io/api/v2',
            headers: {
                Accept: 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
            },
        },
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Workspace',
                        value: 'workspace',
                    },
                    {
                        name: 'Run',
                        value: 'run',
                    },
                    {
                        name: 'Project',
                        value: 'project',
                    },
                ],
                default: 'workspace',
            },
            ...workspaceDescription,
            ...runDescription,
            ...projectDescription,
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const baseUrl = 'https://app.terraform.io/api/v2';

        const request = async (
            options: {
                method: IHttpRequestMethods;
                url: string;
                body?: IDataObject;
                qs?: IDataObject;
                resolveWithFullResponse?: boolean;
                fullResponse?: boolean;
            } & Partial<IHttpRequestOptions>,
        ) => {
            return this.helpers.httpRequestWithAuthentication.call(this, 'terraformCloudApi', {
                json: true,
                ...options,
                fullResponse: options.fullResponse ?? options.resolveWithFullResponse ?? false,
                headers: {
                    Accept: 'application/vnd.api+json',
                    'Content-Type': 'application/vnd.api+json',
                    ...(options.headers as IDataObject | undefined),
                },
            });
        };

        const normalizeResponse = (response: FullResponse | undefined | null) => {
            const statusCode = response?.statusCode ?? response?.status ?? 202;
            const responseBody = response && typeof response === 'object' && 'body' in response ? response.body ?? null : null;
            return { statusCode, responseBody };
        };

        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const resource = this.getNodeParameter('resource', itemIndex) as string;
                const operation = this.getNodeParameter('operation', itemIndex) as string;

                if (resource === 'run') {
                    const runId = this.getNodeParameter('runId', itemIndex, '') as string;
                    const reason = (this.getNodeParameter('reason', itemIndex, '') as string) || undefined;

                    if (operation === 'apply') {
                        const response = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs/${runId}/actions/apply`,
                            body: { comment: reason || 'Applied from n8n' },
                            fullResponse: true,
                        });

                        const { statusCode, responseBody } = normalizeResponse(response as FullResponse);
                        returnData.push({
                            json: {
                                runId,
                                action: 'apply',
                                statusCode,
                                response: responseBody,
                            },
                        });
                        continue;
                    }

                    if (operation === 'cancel') {
                        const response = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs/${runId}/actions/cancel`,
                            body: { comment: reason || 'Cancelled from n8n' },
                            fullResponse: true,
                        });

                        const { statusCode, responseBody } = normalizeResponse(response as FullResponse);
                        returnData.push({
                            json: {
                                runId,
                                action: 'cancel',
                                statusCode,
                                response: responseBody,
                            },
                        });
                        continue;
                    }

                    if (operation === 'discard') {
                        const response = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs/${runId}/actions/discard`,
                            body: { comment: reason || 'Discarded from n8n' },
                            fullResponse: true,
                        });

                        const { statusCode, responseBody } = normalizeResponse(response as FullResponse);
                        returnData.push({
                            json: {
                                runId,
                                action: 'discard',
                                statusCode,
                                response: responseBody,
                            },
                        });
                        continue;
                    }

                    if (operation === 'addComment') {
                        const comment = this.getNodeParameter('comment', itemIndex, '') as string;
                        const response = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs/${runId}/comments`,
                            body: {
                                data: {
                                    type: 'comments',
                                    attributes: {
                                        body: comment,
                                    },
                                },
                            },
                            fullResponse: true,
                        });

                        const { statusCode, responseBody } = normalizeResponse(response as FullResponse);
                        returnData.push({
                            json: {
                                runId,
                                action: 'addComment',
                                statusCode,
                                response: responseBody,
                            },
                        });
                        continue;
                    }

                    if (operation === 'getStatus') {
                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/runs/${runId}`,
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'list') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
                        const qs: IDataObject = {};
                        if (options.pageNumber) qs['page[number]'] = options.pageNumber;
                        if (options.pageSize) qs['page[size]'] = options.pageSize;

                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/workspaces/${workspaceId}/runs`,
                            qs,
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'createPlan') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const message = this.getNodeParameter('message', itemIndex, '') as string;
                        const executionData = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs`,
                            body: {
                                data: {
                                    type: 'runs',
                                    attributes: {
                                        message,
                                        'plan-only': true,
                                    },
                                    relationships: {
                                        workspace: {
                                            data: {
                                                type: 'workspaces',
                                                id: workspaceId,
                                            },
                                        },
                                    },
                                },
                            },
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'createPlanManualApply') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const message = this.getNodeParameter('message', itemIndex, '') as string;
                        const executionData = await request({
                            method: 'POST',
                            url: `${baseUrl}/runs`,
                            body: {
                                data: {
                                    type: 'runs',
                                    attributes: {
                                        message,
                                        'auto-apply': false,
                                    },
                                    relationships: {
                                        workspace: {
                                            data: {
                                                type: 'workspaces',
                                                id: workspaceId,
                                            },
                                        },
                                    },
                                },
                            },
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    throw new NodeOperationError(this.getNode(), `Unsupported run operation: ${operation}`, { itemIndex });
                    continue;
                }

                if (resource === 'workspace') {
                    if (operation === 'getState') {
                        const resolveByName = this.getNodeParameter('resolveByName', itemIndex, false) as boolean;
                        const workspaceName = this.getNodeParameter('workspaceName', itemIndex, '') as string;
                        let workspaceId = this.getNodeParameter('workspaceId', itemIndex, '') as string;

                        if (resolveByName) {
                            const stateOrganization = this.getNodeParameter('stateOrganization', itemIndex, '') as string;
                            const workspaceByName = (await request({
                                method: 'GET',
                                url: `${baseUrl}/organizations/${stateOrganization}/workspaces/${workspaceName}`,
                            })) as IDataObject;

                            const workspaceData = (workspaceByName?.data ?? {}) as IDataObject;
                            workspaceId = (workspaceData.id as string) || '';

                            if (!workspaceId) {
                                throw new NodeOperationError(
                                    this.getNode(),
                                    `Workspace ${workspaceName} in org ${stateOrganization} not found or missing id`,
                                    { itemIndex },
                                );
                            }
                        }

                        const workspace = (await request({
                            method: 'GET',
                            url: `${baseUrl}/workspaces/${workspaceId}`,
                        })) as IDataObject;

                        const workspaceData = (workspace?.data ?? {}) as IDataObject;
                        const relationships = (workspaceData?.relationships ?? {}) as IDataObject;
                        const stateVersionId =
                            ((relationships['current-state-version'] as IDataObject)?.data as IDataObject)?.id ||
                            ((relationships['current_state_version'] as IDataObject)?.data as IDataObject)?.id;

                        if (!stateVersionId) {
                            throw new NodeOperationError(
                                this.getNode(),
                                `Workspace ${workspaceId} has no current state version`,
                                { itemIndex },
                            );
                        }

                        const stateVersion = (await request({
                            method: 'GET',
                            url: `${baseUrl}/state-versions/${stateVersionId}`,
                        })) as IDataObject;

                        const stateVersionData = (stateVersion?.data ?? {}) as IDataObject;
                        const stateVersionAttrs = (stateVersionData?.attributes ?? {}) as IDataObject;
                        const downloadUrl =
                            (stateVersionAttrs['hosted-state-download-url'] as string | undefined) ||
                            (stateVersionAttrs.hosted_state_download_url as string | undefined);

                        returnData.push({
                            json: {
                                workspaceId,
                                stateVersionId,
                                downloadUrl,
                                stateVersion: stateVersionData,
                            },
                        });
                        continue;
                    }

                    if (operation === 'list') {
                        const organization = this.getNodeParameter('organization', itemIndex) as string;
                        const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
                        const qs: IDataObject = {};
                        if (options.pageNumber) qs['page[number]'] = options.pageNumber;
                        if (options.pageSize) qs['page[size]'] = options.pageSize;
                        if (options.search) qs['search[generic]'] = options.search;

                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/organizations/${organization}/workspaces`,
                            qs,
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'get') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/workspaces/${workspaceId}`,
                            qs: { include: 'current_run,latest_run' },
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    throw new NodeOperationError(this.getNode(), `Unsupported workspace operation: ${operation}`, { itemIndex });
                }

                if (resource === 'project') {
                    if (operation === 'list') {
                        const organization = this.getNodeParameter('organization', itemIndex) as string;
                        const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
                        const qs: IDataObject = {};
                        if (options.pageNumber) qs['page[number]'] = options.pageNumber;
                        if (options.pageSize) qs['page[size]'] = options.pageSize;
                        if (options.search) qs['search[generic]'] = options.search;

                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/organizations/${organization}/projects`,
                            qs,
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    throw new NodeOperationError(this.getNode(), `Unsupported project operation: ${operation}`, { itemIndex });
                }

                throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, { itemIndex });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message }, pairedItem: itemIndex });
                    continue;
                }

                throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
            }
        }

        return [returnData];
    }
}
