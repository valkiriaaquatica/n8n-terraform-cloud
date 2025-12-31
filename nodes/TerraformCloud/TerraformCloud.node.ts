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
import { githubAppInstallationDescription } from './resources/githubAppInstallation';

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
                    {
                        name: 'GitHub App Installation',
                        value: 'githubAppInstallation',
                    },
                ],
                default: 'workspace',
            },
            ...workspaceDescription,
            ...runDescription,
            ...projectDescription,
            ...githubAppInstallationDescription,
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

        const extractErrorDetails = (error: unknown) => {
            const errorObject = error as IDataObject;
            const response = (errorObject?.response as IDataObject) || (errorObject?.cause as IDataObject)?.response;
            const body = response?.body as IDataObject | undefined;
            const errors = (body?.errors as IDataObject[] | undefined) || undefined;
            return { response, body, errors };
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
                        const options = this.getNodeParameter('listOptions', itemIndex, {}) as IDataObject;
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

                    if (operation === 'create') {
                        const organization = this.getNodeParameter('organization', itemIndex) as string;
                        const name = this.getNodeParameter('name', itemIndex) as string;
                        const options = this.getNodeParameter('workspaceOptions', itemIndex, {}) as IDataObject;

                        if (!name) {
                            throw new NodeOperationError(this.getNode(), 'Workspace name is required', { itemIndex });
                        }

                        const attributes: IDataObject = {
                            name,
                        };

                        if (options.description) attributes.description = options.description;
                        if (options.autoApply !== undefined) attributes['auto-apply'] = options.autoApply;
                        if (options.autoApplyRunTrigger !== undefined) {
                            attributes['auto-apply-run-trigger'] = options.autoApplyRunTrigger;
                        }
                        if (options.terraformVersion) attributes['terraform-version'] = options.terraformVersion;
                        if (options.workingDirectory) attributes['working-directory'] = options.workingDirectory;
                        if (options.executionMode) attributes['execution-mode'] = options.executionMode;
                        if (options.globalRemoteState !== undefined) {
                            attributes['global-remote-state'] = options.globalRemoteState;
                        }
                        if (options.queueAllRuns !== undefined) attributes['queue-all-runs'] = options.queueAllRuns;
                        if (options.speculativeEnabled !== undefined) {
                            attributes['speculative-enabled'] = options.speculativeEnabled;
                        }
                        if (options.automaticRunTriggering) {
                            attributes['file-triggers-enabled'] = options.automaticRunTriggering !== 'always';
                        }

                        if (options.tagNames) {
                            const tagNames = String(options.tagNames)
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean);
                            if (tagNames.length) attributes['tag-names'] = tagNames;
                        }
                        if (options.triggerPrefixes) {
                            const triggerPrefixes = String(options.triggerPrefixes)
                                .split(',')
                                .map((prefix) => prefix.trim())
                                .filter(Boolean);
                            if (triggerPrefixes.length) attributes['trigger-prefixes'] = triggerPrefixes;
                        }
                        if (options.triggerPatterns) {
                            const triggerPatterns = String(options.triggerPatterns)
                                .split(',')
                                .map((pattern) => pattern.trim())
                                .filter(Boolean);
                            if (triggerPatterns.length) attributes['trigger-patterns'] = triggerPatterns;
                        }

                        const relationships: IDataObject = {};
                        if (options.projectId) {
                            relationships.project = {
                                data: {
                                    type: 'projects',
                                    id: options.projectId,
                                },
                            };
                        }

                        if (options.vcsRepo && typeof options.vcsRepo === 'object') {
                            const vcsRepo = options.vcsRepo as IDataObject;
                            const identifier = (vcsRepo.identifier as string) || '';
                            const oauthTokenId = (vcsRepo.oauthTokenId as string) || '';
                            const githubAppInstallationId = (vcsRepo.githubAppInstallationId as string) || '';
                            const authType = (vcsRepo.authType as string) || '';

                            const wantsVcsConfig =
                                identifier ||
                                oauthTokenId ||
                                githubAppInstallationId ||
                                vcsRepo.branch ||
                                vcsRepo.defaultBranch ||
                                vcsRepo.tagsRegex ||
                                vcsRepo.ingressSubmodules !== undefined;

                            if (wantsVcsConfig) {
                                if (!identifier) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'VCS repo identifier is required when configuring VCS settings',
                                        { itemIndex },
                                    );
                                }

                                const usingOauth = authType === 'oauth' || (!authType && !!oauthTokenId);
                                const usingGithubApp =
                                    authType === 'githubApp' || (!authType && !!githubAppInstallationId);

                                if (usingOauth && usingGithubApp) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'Choose either OAuth token ID or GitHub App installation ID, not both',
                                        { itemIndex },
                                    );
                                }

                                if (usingOauth && !oauthTokenId) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'OAuth token ID is required when auth type is OAuth',
                                        { itemIndex },
                                    );
                                }

                                if (usingGithubApp && !githubAppInstallationId) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'GitHub App installation ID is required when auth type is GitHub App',
                                        { itemIndex },
                                    );
                                }

                                const vcsPayload: IDataObject = {
                                    identifier,
                                    ...(vcsRepo.branch ? { branch: vcsRepo.branch } : {}),
                                    ...(vcsRepo.defaultBranch ? { 'default-branch': vcsRepo.defaultBranch } : {}),
                                    ...(vcsRepo.ingressSubmodules !== undefined
                                        ? { 'ingress-submodules': vcsRepo.ingressSubmodules }
                                        : {}),
                                    ...(vcsRepo.tagsRegex ? { 'tags-regex': vcsRepo.tagsRegex } : {}),
                                };

                                if (usingOauth) {
                                    vcsPayload['oauth-token-id'] = oauthTokenId;
                                } else if (usingGithubApp) {
                                    vcsPayload['github-app-installation-id'] = githubAppInstallationId;
                                }

                                attributes['vcs-repo'] = vcsPayload;
                            }
                        }

                        if (attributes['execution-mode'] === 'agent') {
                            const agentPoolId = (options.agentPoolId as string) || '';
                            if (!agentPoolId) {
                                throw new NodeOperationError(
                                    this.getNode(),
                                    'Agent pool ID is required when execution mode is agent',
                                    { itemIndex },
                                );
                            }
                            attributes['agent-pool-id'] = agentPoolId;
                        }

                        const executionData = await request({
                            method: 'POST',
                            url: `${baseUrl}/organizations/${organization}/workspaces`,
                            body: {
                                data: {
                                    type: 'workspaces',
                                    attributes,
                                    ...(Object.keys(relationships).length ? { relationships } : {}),
                                },
                            },
                        });
                        const variablesInput = options.variables as IDataObject | undefined;
                        const variableItems = (variablesInput?.variable as IDataObject[] | undefined) || [];
                        if (variableItems.length) {
                            const workspaceId = ((executionData as IDataObject)?.data as IDataObject | undefined)?.id as
                                | string
                                | undefined;
                            if (!workspaceId) {
                                throw new NodeOperationError(
                                    this.getNode(),
                                    'Workspace ID missing from create response; cannot create variables',
                                    { itemIndex },
                                );
                            }

                            const createdVariables: IDataObject[] = [];
                            for (let varIndex = 0; varIndex < variableItems.length; varIndex++) {
                                const variable = variableItems[varIndex] as IDataObject;
                                const key = (variable.key as string) || '';
                                const value = variable.value as string | undefined;
                                const category = (variable.category as string) || 'terraform';
                                const sensitive = (variable.sensitive as boolean) ?? false;
                                const hcl = (variable.hcl as boolean) ?? false;
                                const description = (variable.description as string) || '';

                                if (!key) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        `Variable key is required (index ${varIndex})`,
                                        { itemIndex },
                                    );
                                }
                                if (value === undefined) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        `Variable value is required (index ${varIndex})`,
                                        { itemIndex },
                                    );
                                }

                                const variableResponse = await request({
                                    method: 'POST',
                                    url: `${baseUrl}/workspaces/${workspaceId}/vars`,
                                    body: {
                                        data: {
                                            type: 'vars',
                                            attributes: {
                                                key,
                                                value,
                                                category,
                                                sensitive,
                                                hcl,
                                                ...(description ? { description } : {}),
                                            },
                                        },
                                    },
                                });
                                createdVariables.push(variableResponse as IDataObject);
                            }

                            (executionData as IDataObject).createdVariables = createdVariables;
                        }

                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'update') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const options = this.getNodeParameter('workspaceOptions', itemIndex, {}) as IDataObject;
                        const updateName = this.getNodeParameter('updateName', itemIndex, '') as string;

                        const attributes: IDataObject = {};
                        if (updateName) attributes.name = updateName;
                        if (options.description) attributes.description = options.description;
                        if (options.autoApply !== undefined) attributes['auto-apply'] = options.autoApply;
                        if (options.autoApplyRunTrigger !== undefined) {
                            attributes['auto-apply-run-trigger'] = options.autoApplyRunTrigger;
                        }
                        if (options.terraformVersion) attributes['terraform-version'] = options.terraformVersion;
                        if (options.workingDirectory) attributes['working-directory'] = options.workingDirectory;
                        if (options.executionMode) attributes['execution-mode'] = options.executionMode;
                        if (options.globalRemoteState !== undefined) {
                            attributes['global-remote-state'] = options.globalRemoteState;
                        }
                        if (options.queueAllRuns !== undefined) attributes['queue-all-runs'] = options.queueAllRuns;
                        if (options.speculativeEnabled !== undefined) {
                            attributes['speculative-enabled'] = options.speculativeEnabled;
                        }
                        if (options.automaticRunTriggering) {
                            attributes['file-triggers-enabled'] = options.automaticRunTriggering !== 'always';
                        }

                        if (options.tagNames) {
                            const tagNames = String(options.tagNames)
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean);
                            if (tagNames.length) attributes['tag-names'] = tagNames;
                        }
                        if (options.triggerPrefixes) {
                            const triggerPrefixes = String(options.triggerPrefixes)
                                .split(',')
                                .map((prefix) => prefix.trim())
                                .filter(Boolean);
                            if (triggerPrefixes.length) attributes['trigger-prefixes'] = triggerPrefixes;
                        }
                        if (options.triggerPatterns) {
                            const triggerPatterns = String(options.triggerPatterns)
                                .split(',')
                                .map((pattern) => pattern.trim())
                                .filter(Boolean);
                            if (triggerPatterns.length) attributes['trigger-patterns'] = triggerPatterns;
                        }

                        const relationships: IDataObject = {};
                        if (options.projectId) {
                            relationships.project = {
                                data: {
                                    type: 'projects',
                                    id: options.projectId,
                                },
                            };
                        }

                        if (options.vcsRepo && typeof options.vcsRepo === 'object') {
                            const vcsRepo = options.vcsRepo as IDataObject;
                            const identifier = (vcsRepo.identifier as string) || '';
                            const oauthTokenId = (vcsRepo.oauthTokenId as string) || '';
                            const githubAppInstallationId = (vcsRepo.githubAppInstallationId as string) || '';
                            const authType = (vcsRepo.authType as string) || '';

                            const wantsVcsConfig =
                                identifier ||
                                oauthTokenId ||
                                githubAppInstallationId ||
                                vcsRepo.branch ||
                                vcsRepo.defaultBranch ||
                                vcsRepo.tagsRegex ||
                                vcsRepo.ingressSubmodules !== undefined;

                            if (wantsVcsConfig) {
                                if (!identifier) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'VCS repo identifier is required when configuring VCS settings',
                                        { itemIndex },
                                    );
                                }

                                const usingOauth = authType === 'oauth' || (!authType && !!oauthTokenId);
                                const usingGithubApp =
                                    authType === 'githubApp' || (!authType && !!githubAppInstallationId);

                                if (usingOauth && usingGithubApp) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'Choose either OAuth token ID or GitHub App installation ID, not both',
                                        { itemIndex },
                                    );
                                }

                                if (usingOauth && !oauthTokenId) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'OAuth token ID is required when auth type is OAuth',
                                        { itemIndex },
                                    );
                                }

                                if (usingGithubApp && !githubAppInstallationId) {
                                    throw new NodeOperationError(
                                        this.getNode(),
                                        'GitHub App installation ID is required when auth type is GitHub App',
                                        { itemIndex },
                                    );
                                }

                                const vcsPayload: IDataObject = {
                                    identifier,
                                    ...(vcsRepo.branch ? { branch: vcsRepo.branch } : {}),
                                    ...(vcsRepo.defaultBranch ? { 'default-branch': vcsRepo.defaultBranch } : {}),
                                    ...(vcsRepo.ingressSubmodules !== undefined
                                        ? { 'ingress-submodules': vcsRepo.ingressSubmodules }
                                        : {}),
                                    ...(vcsRepo.tagsRegex ? { 'tags-regex': vcsRepo.tagsRegex } : {}),
                                };

                                if (usingOauth) {
                                    vcsPayload['oauth-token-id'] = oauthTokenId;
                                } else if (usingGithubApp) {
                                    vcsPayload['github-app-installation-id'] = githubAppInstallationId;
                                }

                                attributes['vcs-repo'] = vcsPayload;
                            }
                        }

                        if (attributes['execution-mode'] === 'agent') {
                            const agentPoolId = (options.agentPoolId as string) || '';
                            if (!agentPoolId) {
                                throw new NodeOperationError(
                                    this.getNode(),
                                    'Agent pool ID is required when execution mode is agent',
                                    { itemIndex },
                                );
                            }
                            attributes['agent-pool-id'] = agentPoolId;
                        }

                        if (!Object.keys(attributes).length && !options.projectId) {
                            throw new NodeOperationError(this.getNode(), 'No workspace updates were provided', {
                                itemIndex,
                            });
                        }

                        const executionData = await request({
                            method: 'PATCH',
                            url: `${baseUrl}/workspaces/${workspaceId}`,
                            body: {
                                data: {
                                    id: workspaceId,
                                    type: 'workspaces',
                                    ...(Object.keys(attributes).length ? { attributes } : {}),
                                    ...(Object.keys(relationships).length ? { relationships } : {}),
                                },
                            },
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    if (operation === 'delete') {
                        const workspaceId = this.getNodeParameter('workspaceId', itemIndex) as string;
                        const response = await request({
                            method: 'DELETE',
                            url: `${baseUrl}/workspaces/${workspaceId}`,
                            fullResponse: true,
                        });

                        const { statusCode, responseBody } = normalizeResponse(response as FullResponse);
                        returnData.push({
                            json: {
                                workspaceId,
                                action: 'delete',
                                statusCode,
                                response: responseBody,
                            },
                        });
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

                if (resource === 'githubAppInstallation') {
                    if (operation === 'list') {
                        const organization = this.getNodeParameter('organization', itemIndex) as string;
                        const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
                        const qs: IDataObject = {};
                        if (options.pageNumber) qs['page[number]'] = options.pageNumber;
                        if (options.pageSize) qs['page[size]'] = options.pageSize;

                        const executionData = await request({
                            method: 'GET',
                            url: `${baseUrl}/organizations/${organization}/github-app-installations`,
                            qs,
                        });
                        returnData.push({ json: executionData as IDataObject });
                        continue;
                    }

                    throw new NodeOperationError(this.getNode(), `Unsupported GitHub App installation operation: ${operation}`, {
                        itemIndex,
                    });
                }

                throw new NodeOperationError(this.getNode(), `Unsupported resource: ${resource}`, { itemIndex });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message }, pairedItem: itemIndex });
                    continue;
                }

                const { response, body, errors } = extractErrorDetails(error);
                if (errors?.length) {
                    const detail = errors
                        .map((entry) => entry?.detail || entry?.title || entry?.status || JSON.stringify(entry))
                        .filter(Boolean)
                        .join('; ');
                    throw new NodeOperationError(
                        this.getNode(),
                        `${(error as Error).message}${detail ? `: ${detail}` : ''}`,
                        {
                            itemIndex,
                            description: body ? JSON.stringify(body) : undefined,
                        },
                    );
                }

                if (response?.body) {
                    throw new NodeOperationError(this.getNode(), error as Error, {
                        itemIndex,
                        description: JSON.stringify(response.body),
                    });
                }

                throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
            }
        }

        return [returnData];
    }
}
