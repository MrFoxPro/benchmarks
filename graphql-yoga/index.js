import cluster from "cluster";
import { cpus } from "os";
import { createSchema, createYoga } from "graphql-yoga";
import { createServer } from "node:http";
import { useGraphQlJit } from "@envelop/graphql-jit";

if (cluster.isPrimary) {
  for (let i = 0; i < cpus().length; i++) {
    cluster.fork();
  }
  
} else {
  const yoga = createYoga({
    schema: createSchema({
      typeDefs: `
        type Query {
          hello: String!
        }
      `,
      resolvers: {
        Query: {
          hello: () => "world",
        },
      },
    }),
    logging: false,
    plugins: [
      useGraphQlJit(),
    ],
  });

  const server = createServer(yoga);

  server.listen(8000);
}
