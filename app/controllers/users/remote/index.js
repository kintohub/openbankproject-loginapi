import { logger }     from '~/app/configs/runtime/logger';

import {
  unimplementedReject,
  insufficientParamsReject} from '~/app/controllers/utils';

import CloverRemoteUserController from './vendors/clover';
import SquareUpRemoteUserController from './vendors/clover';

const cloverRemoteUserController = new CloverRemoteUserController();
const squareUpRemoteUserController = new SquareUpRemoteUserController();

export default class UserRemoteController {
  create = async ({user, shop}) => {
    if (user && shop) {
      logger.info(`[ShopRemotePayController.create] creating new remote user for: ${user.email}`);

      const {vendorType} = shop;

      switch (vendorType) {
        // TODO
        // case ShopTypes.db.CLOVER_TYPE: {
        //   return await cloverRemoteUserController.create({user, shop});
        // }

        // case ShopTypes.db.SQUAREUP_TYPE: {
        //   return await squareUpRemoteUserController.create({user, shop});
        // }

        default: {
          return unimplementedReject({
            because: `Unknown vendor type: ${vendorType}`,
            _in: "ShopRemotePayController"});
        }
      }
    }
    return insufficientParamsReject();
  }

  get = async ({user, shop}) => {
    if (user && shop) {
      logger.info(`[ShopRemotePayController.get] getting remote user for: ${user.email}`);

      const {vendorType} = shop;

      switch (vendorType) {
        // TODO
        // case ShopTypes.db.CLOVER_TYPE: {
        //   return await cloverRemoteUserController.get({user, shop});
        // }

        // case ShopTypes.db.SQUAREUP_TYPE: {
        //   return await squareUpRemoteUserController.get({user, shop});
        // }

        default: {
          return unimplementedReject({
            because: `Unknown vendor type: ${vendorType}`,
            _in: "ShopRemotePayController"});
        }
      }
    }
    return insufficientParamsReject();
  }

  update = async () => {
    // TODO
  }

  delete = async () => {
    // TODO
  }
}