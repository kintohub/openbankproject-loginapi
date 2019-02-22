import { logger }     from '~/app/configs/runtime/logger';

import BcryptService    from '~/app/services/bcrypt';
import SerializeService from '~/app/services/serialize';

import {
  failedReject,
  unexpectedReject,
  insufficientParamsReject,
  notFoundReject} from '~/app/controllers/utils';

export default class UsersController {
  create = async ({query, serialize = true, isSparse = true}) => {
    const {
      email,
      password,
      signupDeviceToken,
    } = query;
    if (email && password) {
      logger.info(`[UsersController->create]attempting to signup user with ${email}`);
      try {
          const user = await User.findOne({ email: email.toLowerCase() });
          if (user === null) { // unique user
              const hash = await BcryptService.encryptPassword(password);
                // encrypt password
              const newUser = new User({
                  email,
                  password:   hash,
              });
              if (signupDeviceToken) {
                  newUser.deviceTokens = [signupDeviceToken];
              }
              const savedUser = await newUser.save();

              // create tokens
              const verifyEmailToken
                = TokenService.signVerifyEmail({ email: savedUser.email });
              const removeEmailToken
                = TokenService.signRemoveEmail({ email: savedUser.email });

              if (!newUser.isVerified) {
                  // todo: yes it's is awaitable
                  sendVerifyEmail({
                      email: savedUser.email,
                      verifyEmailToken,
                      removeEmailToken
                  }).catch(err => {
                    // if email is invalid -> delete the fucker and reject
                    // currently block by AMAZON sandboxing our account
                    logger.error(`[UsersController->signup] ${err}`);
                  });
              }

              // return saved user
              logger.info(`[UsersController->create]User created with email: ${email}`);

              const serializer = serialize ?
                isSparse ? SerializeService.user.sparse : SerializeService.user.full
                : null;

              const returnUser = serializer ? serializer({item: savedUser}) : savedUser;
              return { user:returnUser};
          }

          return failedReject({because: 'Email is taken' });
      } catch (e) {
          return unexpectedReject({_in: "userController->new", because: e});
      }
    }
    return insufficientParamsReject();
  }

  get = async ({
    query,
    role,
    roles,
    serialize = true,
    isSparse = true,
  }) => {
    const { token } = query;
    if (token) {
      const {id} = await TokenService.getUserIdFromToken(token);

      let userQuery = { _id: id};

      if (roles) {
        userQuery = {
            ...userQuery,
            role: { $in: roles },
        }
      } else if (role) {
          userQuery = {
              ...userQuery,
              role,
          }
      }
      let user;
      try {
        user = await User.findOne(userQuery);
        if (!user || (user.isBanned && user.role !== UserRoles.ROLE_ADMIN)) {
          return notFoundReject({
            what:'user',
            because: "unauthorized",
            _in: "getShopByTypeAndRemoteId"})
        }
      } catch(e) {
        logger.error(`[UserController->getBy] query: ${JSON.stringify(query)} And error: ${e.message} `);
        return unexpectedReject({because:
          `Error looking for occurred while looking for user with id: ${id}`});
      }

      const serializer = serialize ?
      isSparse ? SerializeService.user.sparse : SerializeService.user.full
      : null;

      const returnUser = serializer ? serializer({item: user}) : user;
      return { user:returnUser};
    }

    return insufficientParamsReject();
  }
}