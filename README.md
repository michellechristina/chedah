# Chedah

[![Build Status](https://travis-ci.org/jamesmart77/chedah.svg?branch=master)](https://travis-ci.org/jamesmart77/chedah)

Is the fear of having to overlook your expenses and budgets preventing you from starting a side hustle? Does the word budgeting make you uncomfortable? If there was a way you could just overlook your finances vs. spending time on tracking them, would you go out and start a side gig?

## Lucky for you, there is Chedah!

![Alt Text](https://media.giphy.com/media/5fBH6zoAQg9dHK2ttsc/giphy.gif)

Chedah aims to focus on the "Gig Economy" by allowing users to link their business accounts to a user-friendly dashboard. Users can track everything from their monthly expesnes to their own persoanl business goals. Chedah takes the burden of tracking expenses, so that users can focus on what really matters, making CHEDAH


## Technologies Used

### Authentication

- Plaid API: https://plaid.com/docs/api/
- Auth0: https://auth0.com/


### Databases

- Redis: https://redis.io/
- MongoDb: https://www.mongodb.com/


<h2>Technologies Used</h2>
    <h3>Authentication</h3>
    <ul>
        <li>Plaid API: https://plaid.com/docs/api/</li>
        <li>Auth0: https://auth0.com/</li>
    </ul>
    <h3>Databases</h3>
    <ul>
        <li>Redis: https://redis.io/</li>
        <li>MongoDb: https://www.mongodb.com/</li>
    </ul>
        <h3>Continuous Integration and Testing</h3>
        <ul>
             <li>Jest: https://facebook.github.io/jest/</li>
             <li>CircleCI: https://circleci.com/</li>
        </ul>



<h1>Starting the app locally</h1>

<p>Start by installing front and backend dependencies. While in this directory, run the following commands:<p>


### Continuous Integration and Testing

- Jest: https://facebook.github.io/jest/
- CircleCI: https://circleci.com/

# Starting the app locally

Start by installing front and backend dependencies. While in this directory, run the following commands:

```
yarn install
cd client
yarn install
cd ..
```


After both installations complete, run the following command in your terminal:

```
yarn start
```

That's it, your app should be running on <http://localhost:3000>. The Express server should intercept any AJAX requests from the client.


## Setting up Mongo

1. Install `node-mongo-seeds` globally:

    ```
    npm install -g node-mongo-seeds
    ```

2. Run the seed command:

    ```
    seed
    ```
