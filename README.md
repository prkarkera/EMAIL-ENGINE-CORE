<!-- Steps to run Email-Engine-Core application -->

2 - Start the docker desktop in your system
2 - Run docker compose files with the command
     - docker compose -f backend-docker-compose.yaml up -d
3 - It should start total 3 containers in docker desktop
     - backend app service - email-engine-core
     - elastic search database service - elasticsearch
     - kibana - elastic search ui interface - kibana
4 - Upon linking the account,  the app will sync the email and mailbox data of the user to the local database .
5 - A cron job will run every 30 minutes to sync the email and mailbox data.




