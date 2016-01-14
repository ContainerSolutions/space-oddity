#!/bin/bash

USER = 
PASS =
curl -k -u ${USER}:${PASS} -X POST https://104.155.24.24:8080/v2/apps -d @kibana.json -H "Content-type: application/json"
