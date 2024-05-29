#!/bin/bash

cp ./deploy/subtle-team.service /etc/systemd/system/subtle-team.service

sudo systemctl enable subtle-team.service

sudo systemctl status subtle-team.service

sudo systemctl daemon-reload

sudo systemctl restart subtle-team.service

tail -f /var/log/syslog -n 100
