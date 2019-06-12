FROM node:8.11.2
WORKDIR /user/src/app
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

LABEL vf-OS=true
LABEL vf-OS.name="OPCUADriver"
LABEL vf-OS.author="UPV"
LABEL vf-OS.securityEndpoints="{}"

LABEL vf-OS.restUri="/api/"
LABEL vf-OS.configurationUri="/"
LABEL vf-OS.description="OPC UA driver"

LABEL vf-OS.compose.0.depends_on.0="Driver_mongoDB"
LABEL vf-OS.compose.1.serviceName="Driver_mongoDB"
LABEL vf-OS.compose.1.image="mongo:latest"
LABEL vf-OS.compose.1.volume.0="/docker-entrypoint-initdb.d"
LABEL vf-OS.compose.1.volume.1="/data/db"
