export const errorResp = function ({res, code = 500, e, _in}) {
  return res.status((e && e.status) || code)
  .send({ error: e && (e.stack || e.message) || `${_in ? "["+_in+"]":""}Oh well, no luck`});
}

export default {
  errorResp
};