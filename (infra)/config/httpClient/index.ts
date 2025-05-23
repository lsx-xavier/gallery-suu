/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { SuperAgentRequest } from 'superagent';
import { DefaultHttpsDTO, HttpsGetDTO, HttpsMethods, HttpsPostPutDTO } from './type';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:3000/api';

// Configuração principal do Superagent
const httpClient = {
  get: <T>({ url, params, moreOptions }: HttpsGetDTO) =>
    baseRequest<T>('get', url, params, moreOptions),
  post: <T>({ url, body, moreOptions }: HttpsPostPutDTO) =>
    baseRequest<T>('post', url, body, moreOptions),
  put: <T>({ url, body, moreOptions }: HttpsPostPutDTO) =>
    baseRequest<T>('put', url, body, moreOptions),
  delete: <T>({ url, moreOptions }: DefaultHttpsDTO) => baseRequest<T>('delete', url, moreOptions),
};

// Função base para requisições
async function baseRequest<T>(
  method: HttpsMethods,
  url: string,
  data?: any,
  moreOptions?: (req: SuperAgentRequest) => SuperAgentRequest,
): Promise<T> {
  try {
    console.log('[FETCHING] Start', new Date().toISOString());
    let req: SuperAgentRequest = request[method](`${apiBaseUrl}${url}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    if (moreOptions) {
      req = moreOptions(req);
    }

    // Adiciona dados conforme o método da requisição
    if (method === 'get' && data) req.query(data);
    else if (data) req.send(data);

    const res = await req;

    if (!res) {
      throw {
        body: 'Any response recived.',
        code: 500,
      };
    }
    const finalRes = (await res.body) as unknown as T;
    console.log('[FETCHING] End', new Date().toISOString());
    return finalRes;
  } catch (err) {
    console.log('[FETCHING] Error', new Date().toISOString());
    handleHttpError(err);

    throw new Error(err as string);
  }
}

// Função de tratamento de erros centralizado
function handleHttpError(error: any) {
  if (error?.response) {
    const { body, status } = error.response;
    console.error(`[HTTP ERROR]`, { status, body });

    throw { status, body };
  }

  console.error(`[NETWORK ERROR]`, error);
  throw { status: 0, body: `Erro: ${error.response}` };
}

export default httpClient;
