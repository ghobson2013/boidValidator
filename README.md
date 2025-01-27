# boidValidator
This is the backend code that Boid Validator nodes can run to reach consensus on Boid Power contributions. During the alpha the Validators are only responsible for retrieving parsing and reporting Boid Power ratings for Boid Devices on the Boid Network. Over time the responsibilities of Boid Validator nodes will expand to include other responsibilities.

## Validator Alpha
During the Alpha phase the Boid Validator program is invite-only. Learn more about how to join [here](https://community.boid.com/t/boid-economic-proposal/87). Eventually any person or group will be able to stake BOID and participate as a validator node and receive part of the validator rewards pool. 
## Getting Started
**OS**

This software can run on any OS that supports Docker and Nodejs. Currently it has only been tested on MacOS and Ubuntu 18. Ubuntu is recommended for compatibility and reliability. These instructions are for Ubuntu.

**Install Prerequisites**

[Nodejs](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04)
```
sudo apt update -y
curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs build-essential -y
```
[Docker](https://docs.docker.com/install/) &
[Compose](https://docs.docker.com/compose/install/)
```
sudo wget -qO- https://get.docker.com/ | sh
sudo curl -L "https://github.com/docker/compose/releases/download/1.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

Network time protocol is essential for accurate validation
```
sudo apt install ntp
```

Prisma & PM2
```
npm i -g prisma pm2
```

**Initial Setup**

Clone this repository and enter the directory
```
git clone https://github.com/Boid-John/boidValidator.git
cd boidValidator
```
Install NPM dependencies
```
npm i
```
Setup the docker-compose file
```
cp ./util/example.docker-compose.yml ./docker-compose.yml
or 
cp ./util/example.docker-compose-with-grafana.yml ./docker-compose.yml
```
Setup Docker Containers
```
docker-compose up -d
```
Deploy Prisma Schema: This prepares the database to store validator data.
```
prisma deploy
```
Prepare the .env.json and ecosystem.config.js files.
```
cp ./util/example.ecosystem.config.js ./ecosystem.config.js
cp ./util/example.env.json .env.json
```
Modify the .env.json file using any text editor. The changes you want to make are:
- Provide your validator secret key associated with the EOS account with your BOID stake. Do not use your active or owner key but instead you need to register a special permission on your Validator EOS account.
- Enter the wcg api key: will be provided in the private telegram group

Run one cron group run to ensure there is no error messages.
```
node cron/runCronGroup.js 1
```
This tells the cronRunner to run all jobs defined in group one. 

If you see errors, stop the task (ctl-c) and copy the error logs into the private Validator telegram chat or community forum for feedback.

No errors? Great. You can now setup pm2 to run the cron tasks continuously.
```
pm2 start
```
View the tasks progress (ctrl-c to exit)
```
pm2 logs
```
Save the task so it will automatically start on a reboot
```
pm2 save
pm2 startup
```

PM2 will now daemonize the tasks and run it in the background. When the task crashes or finishes running, PM2 will automatically restart it. So long as your tasks are running without any major errors, your node should easily be able to download data and make accurate Boid Power reports multiple times each round. 

The node validator comes with a (optional) built-in grafana docker that queries directly the postgres DB for metrics. 
It is auto-provisioning a master dashboard with initial usefull metrics. 
To access the grafana dashboard simply point your browser to the IP address of the node validator port 80.
In case you want to inspect how the panels are created you can logon as the administrator by using:
```
   username: admin
   password: boid
```
you can always provide feedback suggestions to its author github:ghobson2013
 
## Reference

### jobgroups.json
This Json is an array of groups.The jobs are in the /cron/jobs folder. Jobs in a group are run sequentially, but you can run multiple groups in parallel to customize and optimize your validator node jobs.

**sleep:** How long to pause after this group has finished before restarting. You can adjust this based on how long a group takes to run on your machine and how many cycles you want to run each hour. You only need to report data once per cycle but there is no harm in making multiple reports for redundancy.

By Default the tasks for group 1 are:

**getDevices:**
Gets the latest list of devices from the main Boid API. This allows the Validator node to associate Work Units and Rvnshares with specific Boid devices.

**getAllWork:** 
This task is a wrapper around two other jobs (getBoincWork and getRvnWork). This wrapper job simply runs those jobs in parallel. These jobs are responsible for downloading Work Units from wcg and sharedata from rvn.boid.com

**devicePowerRatings:**
This Job parses the work data from the previous job, associating it with specifc devices and generating a Boid Power score for each device based on the current "round". A round starts/ends each UTC hour, and the validators need to gather information and make a power report about each device before the end of the current round. The Boid Power ratings are grouped into chunks and then signed with the validator private key to be reported. The reported power ratings from all Validator nodes are then aggregated to reach a final consenus at the end of each round.


### Performance tweaks

This section will outline various tips/tricks that could improve the performance of the node validator.

**postgres DB improvements:**
The following SQL commands have to be executed directly against the postgresql DB ( not via prisma ). By default the docker container is not exposed
to your host OS, you will need to modify docker-composer.yml to expose the default postgres port.
Create an index in the workUnit table, this can be done during runtime.
```
CREATE INDEX "device_index" ON "default$default"."workUnit" USING BTREE ("deviceId");
```
If you need to remove the index simply execute:
```
DROP INDEX "default$default"."device_index";
```
I observed about a 45% improvement in the speed of devicePowerRating cronjob after the index was created.


### Utility functions

Sometimes during testing you want to easily reset your database. I have included a simple script to do this. This will remove all data from your local database and reset it just like new. 

```
sudo sh ./util/resetAll.sh
```

### Join the Validators community
https://community.boid.com/c/validators
