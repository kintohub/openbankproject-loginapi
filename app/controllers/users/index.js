import fetch from "node-fetch";

import { logger }     from '~/app/configs/runtime/logger';
import config       from '~/app/configs/env';

import {
  handleSuccessError,
  failedReject,
  unexpectedReject,
  insufficientParamsReject,
  notFoundReject} from '~/app/controllers/utils';

export default class UsersController {
  create = async ({query}) => {
    const {
      email,
      username,
      password,
      firstName,
      lastName
    } = query;
    if (username && password && email && firstName && lastName) {
      logger.info(`[UsersController->create]attempting to signup user by ${username}`);
      try {
        const resp = await fetch(`${config.baseApiUrl}/obp/v2.0.0/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
              email,
              username,
              password,
              "first_name":   firstName,
              "last_name":    lastName
            })
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[UsersController->create] shit happened for username: ${username}: ${JSON.stringify(error)}`);
          return error;
        });

        if (resp.error) {
          const {code = 500} = resp.error;
          return unexpectedReject({status: code,because: resp.error, _in: "UsersController.create"});
        }

        logger.info(`[UsersController->create] got user`);

        const {token} = await this.authorize({username, password});

        logger.info(`[UsersController->create] got token: ${token}`);

        return {user: resp, token};
      } catch (e) {
          return unexpectedReject({_in: "userController->create", because: e});
      }
    }
    return insufficientParamsReject({_in:"UsersController->authorize"});
  }

  get = async ({
    token,
  }) => {
    if (token) {
      try {
        const resp = await fetch(`${config.baseApiUrl}/obp/v3.0.0/users/current`, {
          method: "GET",
          headers: {
            "Authorization": `DirectLogin token="${token}"`,
            "Content-Type": "application/json",
          }
        })
        .then(handleSuccessError).then(json => json)
        .catch(error => {
          logger.error(`[UsersController->get] shit happened for username: ${username}: ${JSON.stringify(error)}`);
          return error;
        });

        if (resp.error) {
          const {code = 500} = resp.error;
          return unexpectedReject({status: code,because: resp.error, _in: "UsersController.get"});
        }

        return {user: resp};
      } catch (e) {
          return unexpectedReject({_in: "UsersController->get", because: e});
      }
    }
    return insufficientParamsReject({_in:"UsersController->get"});
  }

  authorize = async ({
    username,
    password,
  }) => {
    if (username && password) {
      const resp = await fetch(`${config.baseApiUrl}/my/logins/direct`, {
        method: "POST",
        headers: {
          "Authorization": `DirectLogin username="${username}", password="${password}", consumer_key="${config.consumerKey}"`,
          "Content-Type": "application/json",
        }
      })
      .then(handleSuccessError).then(json => json)
      .catch(error => {
        logger.error(`[UsersController->authorize] shit happened for username: ${username}: ${JSON.stringify(error)}`);
        return error;
      });

      if (resp.error) {
        const {code = 500} = resp.error;
        return unexpectedReject({status: code,because: resp.error, _in: "UsersController.authorize"});
      }

      return resp;
    }

    return insufficientParamsReject({_in:"UsersController->authorize"});
  }
}