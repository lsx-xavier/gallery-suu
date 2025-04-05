import { SuperAgentRequest } from 'superagent';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type HttpsMethods = 'get' | 'post' | 'put' | 'delete';

export interface DefaultHttpsDTO {
  url: string;

  moreOptions?: (req: SuperAgentRequest) => SuperAgentRequest;
}

export interface HttpsGetDTO extends DefaultHttpsDTO {
  params?: Record<string, any>;
}

export interface HttpsPostPutDTO extends DefaultHttpsDTO {
  body?: any;
}
