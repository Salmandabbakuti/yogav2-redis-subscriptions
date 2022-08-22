import { createServer, createPubSub } from '@graphql-yoga/node';
import Redis from "ioredis";
import { createRedisEventTarget } from "@graphql-yoga/redis-event-target";

const publishClient = new Redis();
const subscribeClient = new Redis();
const eventTarget = createRedisEventTarget({
  publishClient,
  subscribeClient,
});

const pubsub = createPubSub({ eventTarget })

const server = createServer({
  schema: {
    typeDefs: /* GraphQL */ `
      type Query {
        hello: String
      }
      type Mutation {
        hello: String
      }
      type Subscription {
        notification: String
      }
    `,
    resolvers: {
      Query: {
        hello: () => 'Hello from Yoga!',
      },
      Mutation: {
        hello: () => {
          pubsub.publish('notification', `Hello GraphQL Subscription! Time: ${new Date()}`);
          return 'Hello from Yoga!'
        },
      },
      Subscription: {
        notification: {
          subscribe: () => pubsub.subscribe('notification'),
          resolve: (payload) => payload
        }
      },
    },
  },
  endpoint: "/",
  maskedErrors: false
})

server.start()