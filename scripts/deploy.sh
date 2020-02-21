#!/bin/bash
host=$1
topdir=/home/server

echo "start to upload to $host"
tar --exclude='./scripts' --exclude='./node_modules' --exclude='./.git' --exclude='./.gitignore' --exclude='./.idea' -zcvf chaos_server.tar.gz .
scp chaos_server.tar.gz "$host:$topdir/prods/"
rm -rf chaos_server.tar.gz

# ssh $host "cd $topdir;./server_update.sh"

echo "finish to upload to $host"