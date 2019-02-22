import fetch from "node-fetch";

import { logger }     from "~/app/configs/runtime/logger";
import config      from "~/app/configs/env";

import SerializeService from "~/app/services/serialize";

import {
  isRemoteShopAuthorized} from "~/app/controllers/shops/remote/utils";

import {
  handleSuccessError,
  insufficientParamsReject,
  unauthorizedReject,
  notFoundReject,
  failedReject,
  unexpectedReject} from "~/app/controllers/utils";

  // TODO
// const VendorDbType = ShopTypes.db.CLOVER_TYPE;
// const {baseApiUrl, payApiUrl} = config.shop[VendorDbType];

  export default class CloverRemoteUserController {

    create = async ({user, shop, query}) => {
      if(user && shop && query) {
        logger.info(`[CloverRemoteUserController.create] `+
        `creating new remote user for: ${user.email}`);

        const {remoteShopId, authToken} = shop;

        const resp = await fetch(`${baseApiUrl}/v3/merchants/${remoteShopId}/customers`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "emailAddresses": [
              {
                "emailAddress": user.email,
              }
            ],
            "firstName": query.userOrderName
          })
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[RemoteShopsController] shit happened ${remoteShopId}: ${JSON.stringify(error)}`);
          return error;
        });
        if (resp.error) {
          if ((resp.status === 401 || resp.status === 403)) {
            await Shop.findOneAndRemove({"_id": shop._id});
            return unauthorizedReject({because: "Shop is unauthorized"})
          } else {
            return unexpectedReject({because: resp.error, _in: "CloverRemoteUserController.create"})
          }
        }
        const {id: remoteUserId} = resp;

        user.remote = user.remote
          .filter(x=>
            x.vendorType !== VendorDbType
            && x.remoteShopId !== remoteShopId
        );

        user.remote = [
          ...user.remote,
          {
            remoteUserId,
            remoteShopId,
            vendorType: VendorDbType,
          }
        ];
        await user.save();
        return {remoteUser: resp};
      }

      return insufficientParamsReject();
    }

    get = async ({user, shop}) => {
      if(user && shop) {
        logger.info(`[CloverRemoteUserController.get] `+
        `getting remote user for: ${user.email}`);

        const {remoteShopId, authToken} = shop;

        const remoteUser = user.remote
        .filter(x=>
          x.vendorType === VendorDbType
          && x.remoteShopId === remoteShopId
        ).pop();

        if (!remoteUser) {
          // no remote user for this user
          return false;
        }

        const {remoteUserId} = remoteUser;

        const resp = await fetch(`${baseApiUrl}/v3/merchants/${remoteShopId}/customers/${remoteUserId}?expand=cards`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${authToken}`}
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[RemoteShopsController] shit happened ${remoteShopId}: ${JSON.stringify(error)}`);
          return error;
        });
        // TODO: remove user id if not found
        if (resp.error) {
          if ((resp.status === 401 || resp.status === 403)) {
            await Shop.findOneAndRemove({"_id": shop._id});
            return unauthorizedReject({because: "Shop is unauthorized"})
          } else if (resp.status === 404) {

            user.remote = user.remote
            .filter(x=>
              x.vendorType !== VendorDbType
              && x.remoteShopId !== remoteShopId
            );

            await user.save();

            return notFoundReject({what:"remoteUser", _in: "CloverRemoteUserController.get" })
          } else {
            return unexpectedReject({because: resp.error, _in: "CloverRemoteUserController.get"})
          }
        }

        var serializedResp = {
          ...resp,
          cards: resp.cards && resp.cards.elements || []//cuz clover has this shit :\
        };

        return {remoteUser: serializedResp}
      }

      return insufficientParamsReject();
    }

    createCard = async ({user, shop, query, payResult, payConfig}) => {
      if(user && shop && query && payResult && payResult.vaultedCard && payConfig) {
        logger.info(`[CloverRemoteUserController.createCard] `+
        `creating remote card for user: ${user.email}`);
        const {remote} = user;

        const {remoteShopId, authToken} = shop;

        const remoteUser = remote.find(x =>
          x.vendorType === VendorDbType
          && x.remoteShopId === remoteShopId);

        let remoteUserResp = {};

        if (!remoteUser || !remoteUser.remoteUserId) {
          remoteUserResp = await this.create({user, shop, query});
        } else {
          remoteUserResp = await this.get({user, shop, query});
        }

        if (!remoteUserResp) {
          return unauthorizedReject({
            because: "failed to fetch remote user",
            _in: "[CloverRemoteUserController.createCard]"});
        }

        const {remoteUser: {id: remoteUserId}} = remoteUserResp;
        const {
          token,
          vaultedCard: {
            expirationDate = "",
            first6 = "",
            last4 = ""
          } = {},
        } = payResult;

        const resp = await fetch(`${baseApiUrl}/v3/merchants/${remoteShopId}/customers/${remoteUserId}/cards`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            expirationDate,
            first6,
            last4,
            token
          })
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[RemoteShopsController] shit happened ${remoteShopId}: ${JSON.stringify(error)}`);
          return error;
        });

        if (resp.error) {
          if ((resp.status === 401 || resp.status === 403)) {
            await Shop.findOneAndRemove({"_id": shop._id});
            return unauthorizedReject({because: "Shop is unauthorized"})
          } else {
            return unexpectedReject({because: resp.error, _in: "CloverRemoteUserController.create"})
          }
        }

        return {resp};
      }

      return insufficientParamsReject();
    }

    deleteCard = async ({user, shop, cardRemoteId}) => {
      if(user && shop && cardRemoteId) {
        logger.info(`[CloverRemoteUserController.delete] `+
        `deleting remote card for user: ${user.email}`);

        const {remoteShopId, authToken} = shop;

        const remoteUser = user.remote
        .filter(x=>
          x.vendorType === VendorDbType
          && x.remoteShopId === remoteShopId
        ).pop();

        if (!remoteUser) {
          // no remote user for this user
          return false;
        }

        const {remoteUserId} = remoteUser;

        const resp = await fetch(`${baseApiUrl}/v3/merchants/${remoteShopId}/customers/${remoteUserId}/cards/${cardRemoteId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${authToken}`}
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[RemoteShopsController] shit happened ${remoteShopId}: ${JSON.stringify(error)}`);
          return error;
        });
        // TODO: remove user id if not found
        if (resp.error) {
          if ((resp.status === 401 || resp.status === 403)) {
            await Shop.findOneAndRemove({"_id": shop._id});
            return unauthorizedReject({because: "Shop is unauthorized"})
          } else if (resp.status === 404) {

            user.remote = user.remote
            .filter(x=>
              x.vendorType !== VendorDbType
              && x.remoteShopId !== remoteShopId
            );

            await user.save();

            return notFoundReject({what:"remoteUser", _in: "CloverRemoteUserController.get" })
          } else {
            return unexpectedReject({because: resp.error, _in: "CloverRemoteUserController.get"})
          }
        }

        return {resp};
      }

      return insufficientParamsReject();
    }
  }