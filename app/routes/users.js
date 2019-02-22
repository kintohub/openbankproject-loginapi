
import { logger }     from '~/app/configs/runtime/logger';

import express from 'express';
const router =  express.Router();

import {errorResp} from '~/app/routes/utils';

import UserController     from '~/app/controllers/users';

const userController      = new UserController();

/**
 * @api {post} /signup Create new user
 * @apiName CreateUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.post('/signup', async (req, res) => {
  const query = req.body;
  const {username, password} = query;

  if (username && password) {
      logger.info(`Incoming create new user with username: ${username}`);
      try {
          const {user, token} = await userController.create({query});

          res.set("Kinto-Session-User-Token", token);

          res.status(200).send({ data: {user} });
      } catch (e) {
          errorResp({res, code:500, e, _in: 'signup'});
      }
  } else {
      errorResp({res, _in: 'signup'});
  }
});

/**
 * @api {get} /me Get meUser
 * @apiName GetUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.get('/me', async (req, res) => {
  logger.info(`Incoming /me request`);
  const token = req.get("Kinto-Session-User-Token");
  logger.info(`And token is ${token}`);
  if (token) {
      try {
          const {user} = await userController.get({ token });

          res.status(200).send({ data: {user} });
      } catch (e) {
          errorResp({res, code:500, e, _in: 'users/:id'});
      }
  } else {
      errorResp({res, _in: 'getting users'});
  }
});

/**
 * @api {post} /login Login user
 * @apiName LoginUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} User obj
 *
 */
router.post('/login', async (req, res) => {
  const query = req.body;
  if (query) {
      try {
          logger.info(`Incoming login request`);
          const {token} = await userController.authorize(query);
          const {user} = await userController.get({ token });

          res.set("Kinto-Session-User-Token", token);

          res.status(200).send({ data: { user }});
      } catch (e) {
          errorResp({res, code:500, e, _in: 'users/login'});
      }
  } else {
      errorResp({res, _in: 'login'});
  }
});

/**
 * @api {post} /logout Logout user
 * @apiName LogoutUser
 * @apiGroup Users
 *
 * @apiSuccess (Success_200) {Object} Ok response
 *
 */
router.post('/logout', async (req, res) => {
  try {
    res.set("Kinto-Session-User-Token", "");
    res.status(200).send({ ok: true });
  } catch (e) {
      errorResp({res, code:500, e, _in: 'users/auth/logout'});
  }
});

module.exports = router;