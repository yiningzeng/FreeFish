#!/bin/bash
nohup python2 free_fish.py > log.log 2>&1 &
pid=$!
echo "pid $pid running"
echo $pid > pid.txt
