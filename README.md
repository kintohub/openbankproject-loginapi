# OBP direct login example project

Referencing flow from: https://github.com/OpenBankProject/OBP-API/wiki/Direct-Login

# First time setup

* run `npm install`

# Run

* `npm run dev` -> will run app in debug mode allowing to attach chrome debugger and watch (making changes to server will hot-reload it)

* `npm start` -> run locally without a debugger

* `npm run prod` -> run in remote

# Magic ✨ User Session
 Block is using kinto-session magic headers to store user related information (auth token), which means **no need of session process on instance 😱**. the app is completely stateless thanks to that.

# Env vars
  - check .env-example
  - default port is 5000 and can be changed using PORT env var
  - to register your own consumer go to -> https://apisandbox.openbankproject.com/user_mgt/login?F724306867266PZBQGY=_

# Api Doc
  - check ApiDoc generated by running `npm run doc`

# Frontend microservice block
 - https://github.com/kintohub/hsbc-hackathon-project-front-end

# Support

http://www.kintohub.com

# OBP API reference

https://apiexplorersandbox.openbankproject.com/?ignoredefcat=true&tags=
