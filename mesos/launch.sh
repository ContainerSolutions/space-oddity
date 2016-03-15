#!/bin/bash

#call with USER and PASS
#careful - need to ensure only one of each
#and get rid of this IP
curl -k -u ${USER}:${PASS} -X POST https://104.155.24.24:8080/v2/apps -d @kibana.json -H "Content-type: application/json"
curl -k -u ${USER}:${PASS} -X POST https://104.155.24.24:8080/v2/apps -d @registry.json -H "Content-type: application/json"
