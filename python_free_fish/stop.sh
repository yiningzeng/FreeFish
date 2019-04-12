#!/bin/bash
kill -9 `cat pid.txt`
ps -ef |grep python2 free_fish.py
rm pid.txt
echo "success"
