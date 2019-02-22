import { logger }     from '~/app/configs/runtime/logger';

import BcryptService    from '~/app/services/bcrypt';

import {
  unexpectedReject,
  insufficientParamsReject,
  notFoundReject,
  conflictReject} from '~/app/controllers/utils';

export default class UsersController {
    login = async ({ query, listsPopulated = false }) => {
      const { email, password } = query;
      if (email && password) {
        logger.info(`[UsersController->login] attempting `+
        `to login with user ${email}`);
          const user = await User.findOne({
              email: escape(email+'').toLowerCase() })
              .select('+password').exec();
          if (!user) {
              return notFoundReject({what: "user", _in: "UsersController->login"});
          }
          return BcryptService.comparePassword(
           (password+''), user.password)
          .then(()=>({user}))
          .catch(() => notFoundReject({what: "user"}));
      }
      return insufficientParamsReject();
    }
}