#!/usr/bin/env bash

git init
heroku git:remote -a $APP_NAME
heroku buildpacks:set heroku/nodejs -a $APP_NAME
git add .
git commit -am "publish back"
git push heroku main --force
rm -rf .git
