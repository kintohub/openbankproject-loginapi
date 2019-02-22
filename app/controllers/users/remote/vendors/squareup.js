import {unimplementedReject} from '~/app/controllers/utils';

export default class SquareupPayController {
  new = async ({shop, query}) => {
    return unimplementedReject({because: "[SquareupPayController]"});
  }
};