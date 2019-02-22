import config from '~/app/configs/env';
import bcrypt from 'bcryptjs';

const encryptPassword = function (str) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(config.encryptionRounds, (genErr, salt) => {
      if (genErr) {
        return reject(genErr);
      }

      bcrypt.hash(str, salt, (err, hash) => {
        if (err) {
        return reject(err);
        }

        resolve(hash);
      });
    });
  });
};

const comparePassword = function (originalPassword, hashPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(originalPassword, hashPassword, (err, match) => {
      if (err) {
 return reject(err);
}

      if (!match) {
        return reject({ status: 401, message: 'password is wrong!' });
      }

      resolve();
    });
  });
};

export default {
    encryptPassword,
    comparePassword,
};