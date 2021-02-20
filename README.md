# moments Api

`moments` is developer Trevor J Alt’s love letter to Instagram,  a social media platform and passion project designed for ongoing development and personal educational growth in how to implement a heavily conditionally rendered environment which handles large amounts of data storage and retrieval.  

And really, who doesn’t love scrolling through photos attached with inspirational quotes and song lyrics?

`moments Api` is the backend for `moments`.  To see `moments` in action, check out [moments](https://moments-live.vercel.app/ "moments").

The `moments` frontend can be found at: [moments-client](https://github.com/trevorjalt/moments-client/ "moments Client")

`moments` supports the creation of your own user account.  If you'd like to experience moments before signing up, use the demo details below.

### demo credentials

* username: kakarot
* password: Kakarot1!

## table of contents.

* [demo credentials](#democredentials)
* [the tech](#the-tech)
  * [backend](#backend)
  * [production](#production)
* [setup](#setup)
  * [requirements](#requirements)
  * [local setup](#local-setup)
* [quick start](#quick-start-scripts)
* [endpoints](#endpoints)
  * [overview](#overview)
  * [authentication](#authentication)
  * [public endpoints](#public-endpoints)
    * [/api/auth/login](#apiauthlogin)
    * [/api/user](#apiuser)
  * [protected endpoints](#protected-endpoints)
    * [/api/user/:user_id](#apiuseruser_id)
    * [/api/connection/followers](#apiconnectionfollowers)
    * [/api/connection/following](#apiconnectionfollowing)
    * [/api/count](#apicount)
    * [/api/feed](#apifeed)
    * [/api/post-caption](#apipost-caption)
    * [/api/post-caption/:requested_user_id](#apipost-captionrequested_user_id)
    * [/api/post-photo/upload](#apipost-photoupload)
    * [/api/post-photo/download](#apipost-photodownload)
    * [/api/post-photo/download/:requested_user_id](#apipost-photodownloadrequested_user_id)
    * [/api/profile-picture/upload](#apiprofile-pictureupload)
    * [/api/profile-picture/upload/:profilepicture_id](#apiprofile-pictureuploadprofilepicture_id)
    * [/api/profile-picture/download](#apiprofile-picturedownload)
    * [/api/profile-picture/download/:profilepicture_id](#apiprofile-picturedownloadprofilepicture_id)

 
## the tech.

### backend.

* Node and Express
  * Authentication via JWT
  * RESTful Api
* Database
  * Postgres
  * Knex.js - SQL wrapper
* Middleware
  * Multer
  * Morgan
  * xss
  * Helmet
  * cors
  * bcryptjs
* Testing
  * Supertest (integration)
  * Mocha and Chai (unit)

### production.

Deployed via Heroku

## setup.

### requirements.
* Postgres v8.5.1
* Node v15.7.0

### local setup.

Clone this repository to your local machine 

````
git clone https://github.com/trevorjalt/moments-api moments-api
````

Change directory into the cloned repository

````
cd moments-api
````

Make a fresh start of the git history for this project

```` 
rm -rf .git && git init
````

Install the node dependencies 

````
npm install
````

Start the Postgres server

````
pg_ctl start
````

Create the development user

````
createuser -Pw --interactive 
````

Type `kakarot` for the name of the `role` to add

Select `y` when asked if the user should be a super user

Press `return` (enter) for no password

Create the development databases

````
createdb -U kakarot moments && createdb -U kakarot moments-test
````

Create a `.env` file in the project root, and include the following:

````
NODE_ENV=development
PORT=8000
DB_URL=postgresql://kakarot@localhost/moments
TEST_DB_URL=postgresql://kakarot@localhost/moments-test
````

Run the migrations for the development database

````
npm run migrate
````

Run the migrations for the development test database

````
npm run migrate:test
````

Seed the development database

````
psql -U kakarot -d moments -f ./seeds/seed.moments_tables.sql
````

## quick start scripts.

Run the `moments` tests

````
npm t
````

Start the application

````
npm start
````

Start nodemon for the application 

````
npm run dev
````

## endpoints.

### overview.

* endpoints
  * /api/auth 
  * /api/user
  * /api/connection 
  * /api/count
  * /api/feed
  * /api/post-caption
  * /api/post-photo
  * /api/profile-picture

### authentication.

`moments` is supported by JWT authentication. A valid `username` and `user_password` must be posted to the [/api/auth/login/](#apiauthlogin) endpoint.  This will return a bearer token that must be included in the header for all protected endpoints.  To create a valid user, see [/api/user/](#apiuser)

### public endpoints.

#### /api/auth/login

* `POST`

`request body` requires:

````
{
  username: '',
  user_password: ''
}
````

#### /api/user

* `POST`

`request body` requires:

````
{
  fullname: '',
  username: '',
  user_password: '',
  email: '',
  about_user: '',
  privacy: [Either 'Public' or 'Private']
}
````

### protected endpoints.

#### /api/user/:user_id

* `GET`

`Header` must include a `JWT Token`

`request params` requires:

````
{
  user_id: [number]
}
````

#### /api/connection/followers

* `GET`

`Header` must include a `JWT Token`

`request user`

````
{
  id: [number]
}
````

#### /api/connection/following

* `GET`

`Header` must include a `JWT Token`

`request user`

````
{
  id: [number]
}
````

#### /api/count

* `GET`

`Header` must include a `JWT Token`

`request user` 

````
{
  id: [number]
}
````

#### /api/feed

* `GET`

`Header` must include a `JWT Token`

`request user`

````
{
  id: [number]
}
````

#### /api/post-caption

* `GET`

`Header` must include a `JWT Token`

`request user` 

````
{
  id: [number]
}
````

#### /api/post-caption/:requested_user_id

* `GET`

`Header` must include a `JWT Token`

`request params` requires:

````
{
  user_id: [number]
}
````

#### /api/post-photo/upload

* `POST`

`Header` must include a `JWT Token`

Endpoint runs through `multer` and requires `multipart/form-data`

`request body` requires:

````
{
  caption_input: ''
}
````

`file` requires:

````
{
    img_type: [req.file.mimetype]
    img_file: [req.file.path]
}
````

#### /api/post-photo/download

* `GET`

`Header` must include a `JWT Token`

`request user` 

````
{
  id: [number]
}
````

#### /api/post-photo/download/:requested_user_id

* `GET`

`Header` must include a `JWT Token`

`request params` requires:

````
{
  requested_user_id: [number]
}
````

#### /api/profile-picture/upload

* `POST`

`Header` must include a `JWT Token`

Endpoint runs through `multer` and requires `multipart/form-data`

`file` requires:

````
{
    img_type: [req.file.mimetype]
    img_file: [req.file.path]
}
````

#### /api/profile-picture/upload/:profilepicture_id

* `PATCH`

`Header` must include a `JWT Token`

Endpoint runs through `multer` and requires `multipart/form-data`

`request params` requires:

````
  profilepicture_id: [number]
````

`file` requires:

````
{
    img_type: [req.file.mimetype]
    img_file: [req.file.path]
}
````

#### /api/profile-picture/download

* `GET`

`Header` must include a `JWT Token`

`request user` 

````
{
  id: [number]
}
````

#### /api/profile-picture/download/:profilepicture_id

* `GET`

`Header` must include a `JWT Token`

`request params` requires:

````
{
  profilepicture_id: [number]
}
````

## "it's all about the moments" 
