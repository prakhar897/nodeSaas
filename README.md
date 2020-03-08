# Saas-starter
This is a starting repository to create a simple Saas App. It contains a built in authentication feature and billing using stripe feature.

**How to run**
- clone the repository
- open cmd and type npm i
- change .env.example to .env. You also need to fill all the variables.
- you need to define database driver url (I personally use mLab)

**Notes**
- Endpoint Url refers to stripe webhook url. You need to have a public url to access it. I personally prefer ngrok but you can use stripeCLI too.
- Stripe plan can be found on stripe dashboard.
- session secret is a random string for express session.