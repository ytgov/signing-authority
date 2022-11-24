# Development

### 1. Configure Environment Variables
### 2. Bring up MongoDB
From the root of the project directory run:
```
 docker compose --env-file ./.env.development --file docker-compose.dev.yaml up --build
```
### 3. Bring up API Server
From the root of the project directory run:
```
cd signing-authority/api/
npm run start
```
By default, this will bring up an instance of the API server on port 3000.  The API server will automatically reload on save.

*Note:* changes to .env variables require a shutdown and restart to server to take effect.
### 4. Bring up API Front End Server
From the root of the project directory run:
```
cd signing-authority/web/
npm run start
```
By default, this will bring up an instance of the front end server on port 8080.

*Note:* changes to .env variables require a shutdown and restart to server to take effect.
### 5. Confirm dev environment
To confirm the environment is working properly, navigate to:
[http://localhost:8080/administration]http://localhost:8080/administration

### 5. Seed data *(optional)*
## Run using prebuilt images
Stand up a version of the app using prebuilt images:

`docker compose --env-file ./.env.development --file docker-compose.dev.yaml up --build`


## Production
The production environment builds and deploys two containers, a Mongo database server and a front end Node/Express app which serves the front end and the api services.  For persistent storage, a docker volume is created as part of the process.  One the build process is complete and the containers are deployed you can reach the app at https://<dockerhost>:3000/public

### Build and Run the Prodcuction Containers

`docker compose --env-file ./.env.production up -d --build`

### Stop Containers
To stop the container run but leave the database storage volume intact, run:

`docker compose --env-file ./.env.production down`

To stop the container _and_ remove the database storage volume run:

`docker compose --env-file ./.env.production down -v`

---

# Project Structure


Single project that builds into two containers.



## Backend
**Root:** <project_root>/api

Technology:
- Node
- Express
- TypeScript
- JWT based authentication

**Auth:** Authenticated routes use JWT tokens. Secure routes with `RequiresAuthentication` middleware.

## Frontend
**Root:** <project_root>/web

### Layouts
Reusable application layouts are defined in [/web/src/layouts](./web/src/layouts/).  Modules must embed their views and components in a [layout](./web/src/layouts/)
### Modules
Each logical section of the appplication is broken into modules.  Modules are defined in [/web/src/modules](./web/src/modules/).

Modules contain all the Vue code needed for the modules including:
- store (vuex)
- routes (vue-router)
- componenents
- views

### Authentication
Authenication is done with JWTs. It is handled by a plugin defined in [./web/src/auth/auth0-plugin.js](./web/src/auth/auth0-plugin.js).  The first time the application loads it will atempt to silently log the user in via `getTokenSilently()`.  If that fails, the users will be redirected to a login process.  Note: it can take up to 30 seconds to complete the authentication process.

Authentication information is available anywhere in the Vue frontend via a call to `this.$auth`.

**$auth.user**
- returns information about the currently logged in user

**$auth.isAuthenticated**
 - returns true if the user is authenticated

#### Azure AD Authentication
User can authenticate using their corporate account.  This is handed via federation in the backend authentication configuration.


## Clearing out the MongoDB collecions from a command line

```
docker exec -it <docker_container_name> bash

use authorities

show collections

db.runCommand({count: 'PositionGroups'})
db.PositionGroups.remove({})

db.runCommand({count: 'Authorities'})
db.Authorities.remove({})

db.runCommand({count: 'FormA'})
db.FormA.remove({})

db.runCommand({count: 'SAA-FILES.chunks'})
db['SAA-FILES.chunks'].remove({})

db.runCommand({count: 'SAA-FILES.files'})
db['SAA-FILES.files'].remove({})
```
