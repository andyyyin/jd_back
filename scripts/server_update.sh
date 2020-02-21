#!/bin/bash

cd ./prods
tar zxvf chaos_server.tar.gz
npm install
pm2 restart main