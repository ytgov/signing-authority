---
## Run using prebuilt images
Stand up a version of the app using prebuilt images:

`docker compose --env-file ./.env.development --file docker-compose.dev.yaml up --build`


---
## Production
The production environment builds and deploys two containers, a MySQL database server and a front end Node app which serves the front end and the api services.  For persistent storage, a docker volume is created as part of the process.  One the build process is complete and the containers are deployed you can reach the app at https://<dockerhost>:3000/public

### Build and Run the Prodcuction Containers

`docker compose --env-file ./.env.production up -d --build`

### Stop Containers
To stop the container run but leave the database storage volume intact, run:

`docker compose --env-file ./.env.production down`

To stop the container _and_ remove the database storage volume run:

`docker compose --env-file ./.env.production down -v`

---