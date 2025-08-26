
# Upgrade steps to go from mongo:7.0 to mongo:8.0 Docker image

## Compatibility

- Connect to mongo container  (`docker exec -it <container_name> bash`)
  - Once inside container, run: `mongosh -u admin` and enter the password
  - Inside mongosh, run: `db.adminCommand( { getParameter: 1, featureCompatibilityVersion: 1 })`
   - It should return: `{ featureCompatibilityVersion: { version: '7.0' }, ok: 1 }`
  - If not, set it with: `db.adminCommand( { setFeatureCompatibilityVersion: "7.0" })`
  - exit the mongosh
  - exit the container

## Upgrade

- Pull the new image: `docker pull mongo:8.0`
- Switch the service definition to use the tag `mongo:8.0` and restart the container, leaving the data volume and other settings the same
- Restart the container
- Connect to mongo container  (`docker exec -it <container_name> bash`)
  - Once inside container, run: `mongosh -u admin` and enter the password
  - Inside mongosh, run: `db.adminCommand( { setFeatureCompatibilityVersion: "8.0", confirm: true })`
  - exit the mongosh
  - exit the container

  ## Verify

  - Restart the application and ensure it can connect to the new container