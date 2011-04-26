#!/bin/bash

MONGO_HOME=$HOME/Tools/mongodb-linux-i686-1.6.5
MONGO_BIN=$MONGO_HOME/bin/mongod
MONGO_ARGS="--dbpath $MONGO_HOME/data/db/"
PID_DIR=/tmp
MONGO_PID=$PID_DIR/mongod.pid
NODE_PID=$PID_DIR/node.pid

NODE_HOME=$HOME/Projekte/Node
TODO_APP=todo.js

start_todo() {
  $MONGO_BIN $MONGO_ARGS 2>&1 >> /dev/null &
  echo $! > $MONGO_PID
  node $NODE_HOME/$TODO_APP 2>&1 >> /dev/null &
  echo $! > $NODE_PID
}

stop_todo() {
  if [ -e $NODE_PID ]; then
    kill `cat $NODE_PID`
  fi
  if [ -e $MONGO_PID ]; then
    kill `cat $MONGO_PID`
  fi
}

case "$1" in
  start) 
    start_todo
  ;;
  stop)
    stop_todo
  ;;
  *) 
    echo "Usage: $0 start|stop"
  ;; 
esac

