const { createServer } = require("http");
const {readFileSync} = require('fs');
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const {makeExecutableSchema} = require('graphql-tools');
const express = require('express');
const {execute, subscribe} = require('graphql');
const {SubscriptionServer} = require('subscriptions-transport-ws');
const {PubSub} = require('graphql-subscriptions');

const pubsub = new PubSub();
const getStats = () => ({
    salads: salads.length,
    burgers: burgers.length
});
const get = (what, count) => what.splice(0, parseInt(count) || 1);
const salad = { avocado: 1, mango: 1, tomato: 0.2, arugula: true, onion: true };
const burger = { buns: 2, shrimp: 1, egg: 1, lettuce: 2.5, mayo: true };
const salads = [];
const burgers = [];
const schema = makeExecutableSchema({
    typeDefs: readFileSync('schema.graphql', 'utf8'),
    resolvers: {
        Query: {
            salads: (_, {count}) => get(salads, count),
            burgers: (_, {count}) => get(burgers, count)
        },
        Mutation: {
            addSalads: (_, {count}) => {
                salads.push(...new Array(count).fill(salad));
                pubsub.publish('foodAdded', {foodAdded: getStats()});
                return salads.length;
            },
            addBurgers: (_, {count}) => {
                burgers.push(...new Array(count).fill(burger));
                pubsub.publish('foodAdded', {foodAdded: getStats()});
                return burgers.length;
            }
        },
        Subscription: {
            foodAdded: {
                subscribe: () => 
                    pubsub.asyncInterator('foodAdded')
            }
        }
    }
});
const persistedQueries = require('./persisted-queries');
const app = express();

app.get('/salads', ({ query: { count } }, res) => 
    res.json(get(salads, count)));

app.get('/burgers', ({ query: { count } }, res) => 
    res.json(get(burgers, count)));

app.use('/graphql', bodyParser.json(), (req, res, next) => {
    if (req.method === 'GET' && persistedQueries[req.query.id]) {
        req.query.query = persistedQueries[req.query.id];
        delete req.query.id;
    }
    if (req.method === 'POST' && persistedQueries[req.body.id]) {
        req.body.query = persistedQueries[req.body.id];
    }
    next();
})
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}));
app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:4000/subscriptions'
}));

const server = createServer(app);
server.listen(4000);

new SubscriptionServer(
    {schema, execute, subscribe},
    {path: '/subscriptions', server}
);
