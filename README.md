## xinney

Requirements:

- Node.js 14.x
- Mongodb 
- yarn (use `yarn add <npm_module>` instead of `npm install <npm_module>`)

### Installations

#### Mongodb Installation
```bash
sudo apt update && sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb    (This is to enable mongodb on computer restart)

```
#### Nodejs 14

Reference: https://computingforgeeks.com/install-node-js-14-on-ubuntu-debian-linux/

```bash
sudo apt update
curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
sudo apt -y install nodejs
```
Check nodejs version at this point using node -v
```bash
sudo apt -y install gcc g++ make
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```
#### Docker Container Setup

Reference: https://docs.docker.com/engine/install/ubuntu/

```bash
sudo apt-get remove docker docker-engine docker.io containerd runc
sudo apt-get update
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```
Test Installation `sudo docker run hello-world`

Compose Setup: https://docs.docker.com/compose/install/
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```
#### Build Docker container

This might take multiple runs of the command depending on internet connection. The command will resume from the step it failed.

`sudo docker-compose up --build`

#### Seed Data for application
In a separate terminal add required data.

`docker exec -it xinney-web yarn seed`


### Development

Development environment is containerized with Docker.

Executing `sudo docker-compose up` will start a localhost setup for development with following services:

- xinney-smtp: test emails during development - <http://localhost:1080>
- xinney-mongo: mongoDB in port 27017
- xinney-web: express app - <http://localhost:8080>

#### More docker commands for testing

### Testing

```bash
# run test suite
yarn test

# watch mode - test suite runs every time there's a file change
yarn test:watch
```

NOTE: There is a [bitbucket pipeline](https://bitbucket.org/amitdh123/xinney/addon/pipelines/home) setup on `master` branch - which runs the test suite when new commits are pushed to master.
# internE-commerce
