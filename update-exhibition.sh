#!/bin/bash

cd /home/pi/kadist-dark-clouds-exhibition
git pull origin
couchapp push app/ http://localhost:5984/liblib
echo "^if everything is ok you should see a strange URL above ^"