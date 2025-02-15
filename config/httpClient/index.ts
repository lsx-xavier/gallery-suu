/* eslint-disable @typescript-eslint/no-explicit-any */
import request, { SuperAgentRequest } from 'superagent';
import { DefaultHttpsDTO, HttpsGetDTO, HttpsMethods, HttpsPostPutDTO } from './type';

const apiBaseUrl = "/api"
type TypedResponse<T> = Response & { body: T };

// Configuração principal do Superagent
const httpClient = {
  get: <T>({  url, params, moreOptions }: HttpsGetDTO) => baseRequest<T>( 'get', url, params, moreOptions ),
  post: <T>({  url, body, moreOptions }: HttpsPostPutDTO) => baseRequest<T>( 'post', url, body, moreOptions ),
  put: <T>({  url, body, moreOptions }: HttpsPostPutDTO) => baseRequest<T>( 'put', url, body, moreOptions ),
  delete: <T>({  url, moreOptions }: DefaultHttpsDTO) => baseRequest<T>( 'delete', url, moreOptions ),
};

// Função base para requisições
async function baseRequest<T>(
  method: HttpsMethods,
  url: string,
  data?: any,
  moreOptions?: (req: SuperAgentRequest) => SuperAgentRequest
): Promise<TypedResponse<T> | null> {
  try {
    let req: SuperAgentRequest = request[method](`${apiBaseUrl}${url}`)
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

      if(moreOptions) {
        req = moreOptions(req)
      }

    // Adiciona dados conforme o método da requisição
    if (method === 'get' && data) req.query(data);
    else if (data) req.send(data);

    // Log da requisição (debug)
    console.debug(`[${method.toUpperCase()}] ${apiBaseUrl}${url}`, data || '');

    const res = await req;

    if(!res) {
      throw new Error("Any response recived")
    }
    
    return res as unknown as TypedResponse<T>;
  } catch (err) {
    handleHttpError(err);
    return null;
  }
}

// Função de tratamento de erros centralizado
function handleHttpError(error: any) {
  if (error.response) {
    console.error(`[HTTP ERROR]`, {
      status: error.status,
      body: error.response.body,
    });
  } else {
    console.error(`[NETWORK ERROR]`, error);
  }
}


export default httpClient;