
# nodeSaas

![License](http://img.shields.io/:license-mit-blue.svg)

Inspired By [alecrocute's](https://github.com/alectrocute)[flaskSaas](https://github.com/alectrocute/flaskSaaS). I've noticed SaaS bootstraps/boilerplates being sold upwards of $1,000 per year and I think that's fucking ridiculous. This project will be my attempt to make a great starting point for your next big business as easy and efficent as possible.

## Features

- [x] User account sign up, sign in
- [x] Stripe subscriptions.
- [ ] HTML macros and layout file.
- [ ] password reset, all through asynchronous email confirmation.
- [ ] Form generation.
- [ ] Error handling.
- [ ] "Functional" file structure.
- [ ] Administration panel.
- [ ] Logging.
- [ ] Simple RESTful API to communicate with your app.

## Libraries

### Backend

- [Node.js](https://nodejs.org/en/), obviously.

### Frontend

- [Bootstrap](http://getbootstrap.com/) for the global style.

## Structure

Currently, everything is contained in the `/` folder.

- There you have the classic `static/` and `templates/` folders. The `templates/` folder contains macros, error views and a common layout.
- I added a `views/` folder to separate the user and the website logic, which could be extended to the the admin views.

## Setup

### Vanilla

- Install the requirements and setup the development environment.

	`clone the repository`
    `type npm i`
    `change .env.example to .env. You also need to fill all the variables`
    `you need to define database driver url (I personally use mLab)`

- Notes

	`Endpoint Url refers to stripe webhook url. You need to have a public url to access it. I personally prefer ngrok but you can use stripeCLI too.`
    `Stripe plan can be found on stripe dashboard.`
    `session secret is a random string for express session.`
    `Add ngrok url to stripe checkpoint hook.`

- Run the application.

	`node index.js`

- Navigate to `localhost:3000`.

## License

The MIT License (MIT). Please see the [license file](LICENSE) for more information.
