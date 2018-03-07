// import { CastError } from "mongoose";
const db = require("../models");
const plaid = require('plaid');
const gigController = require('./gigController');
const util = require('util')
const axios = require('axios')
// const {not} = require('ramda')
require('dotenv').config();
const request = require("request");

var client = new plaid.Client(
  process.env.PLAID_CLIENT_ID, // these values need to be updated and stored in a .env
  process.env.PLAID_SECRET, // these values need to be updated and stored in a .env
  process.env.PLAID_PUBLIC_KEY, // these values need to be updated and stored in a .env
  plaid.environments.sandbox
);

// Defining methods for the booksController
module.exports = {

  getUser: (req, res) => {
    console.log('getting the user')
    db.User.findOne({auth_id: req.params.authId})
    .populate('accounts')
    .populate('transactions')
    .populate('gigs')
    .populate({
      path: 'gigs',
      populate: {
        path: 'goals',
        model: 'Goal'
      }
    })
    .then(dbUser => {
      const user = JSON.parse(JSON.stringify(dbUser, null, 2))
      
      
      const isNegative = num => num < 0 ? true : false
      const isPositive = num => num > 0 ? true : false
      const sum = (x,y) => Math.abs(x) + Math.abs(y)

      
      user.accounts = user.accounts.map(account => {
        account.transactions = user.transactions.filter(t => t.account_id === account.account_id)
        return account
      })
      


      user.gigs = user.gigs.map(gig => {
        gig.transactions = user.transactions.filter(t => t.gigId === gig._id)
        gig.moneyIn = gig.transactions
                        .map(t => t.amount)
                        .filter(isPositive)
                        .reduce(sum)
                        .toFixed(2)

        gig.moneyOut = gig.transactions
                        .map(t => t.amount)
                        .filter(isNegative)
                        .reduce(sum)
                        .toFixed(2)

        gig.net = gig.moneyIn - gig.moneyOut
                      
        return gig
      })



      console.log('user.accounts')
      console.log(JSON.stringify(user.accounts, null, 2))

      return user
    })
      .then(user => res.json(user))
      .catch(err => res.status(404).json({err: "didn't find it"}))
  },

  createUserIfDoesNotExist: (req, res) => {
    console.log("HITTING IT")
    const user = {
      firstName: req.body.given_name || null,
      lastName: req.body.family_name || null,
      auth_id: req.body.sub,
      email: req.body.email
    }
    db.User
      .create(user)
      .then(dbModel => {
        //create personal gig as default because user was just created
        gigController.createGig({
          "name": "Personal"
        })
          //assoc new gig to user model
          .then(gigModel => db.User.findOneAndUpdate({
              _id: dbModel._id
            }, {
              $push: {
                gigs: gigModel._id
              }
            }, {
              new: true
            })
          )
          .then(dbUser => res.json(dbUser))
          .catch(err => {
            console.log('error')
            console.log(err)
            res.status(404).json({
              err: err
            });
          });
      })
      .catch(err => {
        console.log("error")
        console.log(err)
        err.code === 11000 ? res.json({
          userExist: true
        }) : res.status(404).json({
          err: err
        })
      });
  },

  addItemToUser: (data, res) => {

    console.log(data.user)
    db.User
      .findOneAndUpdate({
        "auth_id": data.user.sub
      }, {
        $push: {
          "items": {
            "access_token": data.item.ACCESS_TOKEN,
            "item_id": data.item.ITEM_ID
          }
        }
      }, {
        upsert: true
      })
      .then(dbUser => {
        // axios request here
        axios.defaults.headers.post['Content-Type'] = 'application/json';
        axios.post('https://sandbox.plaid.com/accounts/get', {
            client_id: process.env.PLAID_CLIENT_ID,
            secret: process.env.PLAID_SECRET,
            access_token: data.item.ACCESS_TOKEN
        })
        .then(res => {
          const promises = res.data.accounts.map(account => {
            db.Gig.findOne({
              name: 'Personal'
            }).then(dbGig => {
              account.defaultGigId = dbGig._id
              db.Account.create(account)
              .then(dbAccount => {
                console.log('created account')
                return db.User.findOneAndUpdate({
                  _id: dbUser._id
                }, {
                  $push: {
                    accounts: dbAccount._id
                    }
                  }, {
                    new: true
                  })
                })
                .catch(console.log)
              })
            }).then(dbUser => {
              res.json(dbUser)
              console.log(res.data)
            })
            .catch((err) => {
              console.log("error adding item to user");
              console.log(err);
              res.json(err);
            });
            }).catch(console.log)
            
        })


    // res.json({userId});
  },

  // all gigs need to be associated with a user
  addGigToUser: (req, res) => {
    console.log(req.body)
    db.Gig.create({'name': req.body.name})
    .then(dbGig => {
      console.log(dbGig._id)
      return db.User
      .findOneAndUpdate({
        "auth_id": req.params.authId
      }, {
        $push: {
          gigs: dbGig._id
        }
      }, {
        new: true
      })
    })
    .then(dbUser => res.json(dbUser))
    .catch(err => {
      console.log(err)
      res.status(500).json({err: err})
    })
},

  getTransactions: (req, res) => {

    db.User
      .findOne({
        "auth_id": req.body.sub
      })
      .then((dbUser) => {
        // console.log(dbUser)

        // Pull transactions for the Item for the last 30 days
        const startDate = '2017-01-01'; //moment().subtract(30, 'days').format('YYYY-MM-DD');
        const endDate = '2018-02-01'; //moment().format('YYYY-MM-DD');

        axios.defaults.headers.post['Content-Type'] = 'application/json';
        const transactionPromises = dbUser.items.map(item => axios.post('https://sandbox.plaid.com/transactions/get', {
                                                                    client_id: process.env.PLAID_CLIENT_ID,
                                                                    secret: process.env.PLAID_SECRET,
                                                                    access_token: item.access_token,
                                                                    start_date: startDate,
                                                                    end_date: endDate,
                                                                    options: {
                                                                      count: 250,
                                                                      offset: 0
                                                                    }
                                                                }))


        // console.log(transactionPromises)

        Promise.all(transactionPromises)
          .then(transactionsResponseArray => {
            const transactions = transactionsResponseArray
              .map(transactionResponses => transactionResponses.data.transactions)
              .reduce((acc, cv)=> acc.concat(cv))
              .filter(transaction => !transaction.pending)
              
              console.log('pulled ' + transactions.length + ' transactions');

              db.Account.find()
                .then(dbAccounts => {
                  var i = 0;
                  while (i < transactions.length) {
                    const accountThatMatchesTransactionId = dbAccounts.find( account => transactions[i].account_id === account.account_id);
                    // console.log(transactions[i].account_id === dbAccounts.account_id)
        
                      //create transaction object to insert into DB
                      let transactionObj = {
                        amount: transactions[i].amount,
                        category: transactions[i].category !== null ? transactions[i].category[0] : 'Other',
                        date: transactions[i].date,
                        transactionName: transactions[i].name,
                        transaction_id: transactions[i].transaction_id,
                        account_id: transactions[i].account_id,
                        gigId: accountThatMatchesTransactionId.defaultGigId
                      }
        
                      //add transaction to transaction collection
                      //if transactionID is already in collection, transaction will not be added
                      db.Transaction
                        .create(transactionObj)
                        .then((dbTrans) => {
                          //add new transactionID to user.items.transactions array
                          db.User
                            .update(
                              {"auth_id": req.body.sub},
                              //addToSet pushes to array if item does not already exist
                              { "$addToSet": {"transactions": dbTrans._id}}
                            )
                            .catch((err) => console.log(err))
                        })
                        .catch((err) => {
                          // console.log("transaction insert failed");
                          // console.log(err);
                          // console.log("\nTransaction object");
                          // console.log(transactionObj);
                        })
        
                    //iterate through all transactions in while loop 
                    i++
                  }
                })
                .catch(console.log)

             
              res.json({msg: "transactions loaded successfully"});
            });
    

          })

          .catch(err => {
            console.log("error in getting plaid transactions");
            console.log(error);
            res.json({
              error: err
            })
          })

        
      // .catch((err) => console.log(err))
  },
  getCategories: (req, res) => {
    request.post("https://sandbox.plaid.com/categoies/get").on('response', function(response) {
    console.log(response.statusCode) // 200
    console.log(response.headers['content-type']) // 'image/png'
  })

  }
};
