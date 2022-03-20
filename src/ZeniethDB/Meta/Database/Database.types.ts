import { ZeneithSchema } from "./Schema.types";

export type ZeneithDatabaseCreationData = {
 databaseName: string;
 collections: {
  name: string;
  schema: ZeneithSchema;
 }[];
};

export type ZeneithDatabaseLayout = ZeneithDatabaseCreationData[];
