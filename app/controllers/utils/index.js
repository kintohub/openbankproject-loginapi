import { logger }     from '~/app/configs/runtime/logger';
import { isString } from 'util';

const genericReject = (obj) => (({status, because, _in}) => {
  const becauseMessage = isString(because) ? because : because.message
  logger.error(`[${_in}]:${becauseMessage}`);
  return Promise.reject({status, message: becauseMessage});
})({status: 500, because: "things suck", _in:"somePlace",...obj});

export const insufficientParamsReject = (obj) => (({_in}) =>
  genericReject({status: 403, because: 'Request params are not sufficient', _in}))({_in:"somePlace", ...obj});
export const notFoundReject = (obj) => (({what, because, _in}) =>
  {
    const cuzMsg = because || `Requested ${what} does not exists or not found.`;
    return genericReject({status: 404, because: cuzMsg, _in});
  })({what: 'id', because: "", _in:"somePlace", ...obj});
export const failedReject = (obj) => (({because, _in}) =>
  genericReject({status: 400, because, _in}))({because: "operation failed", _in:"somePlace",...obj});
export const unauthorizedReject = (obj) => (({because, _in}) =>
  genericReject({status: 401, because, _in}))({because: "unauthorized", _in:"somePlace",...obj});
export const conflictReject = (obj) => (({because, _in}) =>
  genericReject({status: 409, because, _in}))({because:"", _in:"somePlace", ...obj});
export const unimplementedReject = (obj) => (({because, _in}) =>
    genericReject({status: 501, because, _in}))({because:"", _in:"somePlace",...obj});
export const unexpectedReject = (obj) => (({because, _in}) =>
    genericReject({status: 502, because, _in}))({because: "Things did not worked out 🤷‍♂️", _in:"somePlace",...obj});

export const handleSuccessError = function(response){
    const isJson = !!response.headers.get("content-type").match('application/json');

    return response.status < 300 ?
      (isJson ? response.json() : response.text())
      : response.json().then(error => {
        if (error.message && error.message === "Cannot parse JSON") {
          error = {
            message: response.statusText,
            status: response.status
          }
        }
        return Promise.reject({error, status: response.status});
      });
}

export default {
  handleSuccessError,
  insufficientParamsReject,
  notFoundReject,
  unauthorizedReject,
  unimplementedReject,
  unexpectedReject,
  failedReject,
  conflictReject
};