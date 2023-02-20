import type { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import type { ZeneithDatabaseSchema } from "./Meta/Zeneith/Database.schema.js";


import { DataBase } from "./Database/Database.js";
import { ZeneithUtil } from "./ZeneithUtil.js";

export const ZeneithDBCore = {
 dataBase: <DataBase>{},
 __version: 1,
 loadedDatabases: <Record<string, DataBase>>{},

 util: ZeneithUtil,

 async initialize() {
  this.dataBase = new DataBase(
   {
    databaseName: "ZeneithDB",
    collections: [
     {
      name: "meta",
      schema: [],
     },
     {
      name: "collections",
      schema: [],
     },
     {
      name: "databases",
      schema: [],
     },
    ],
   },
   true
  );

  const version = await this.dataBase.getDatabaeVersion();
  if (version != this.__version + 1) {
    console.warn("ZeneithDB is being created.");
   await this.dataBase.$create();
  }
  await this.dataBase.open();
 },

 async createDataBase(data: ZeneithDatabaseCreationData) {
  const databaseCheck = await this.dataBase.getData(
   "databases",
   data.databaseName
  );
  if (databaseCheck) {
   throw new Error(
    `The database ${data.databaseName} already exists. Use 'updateDatabase' to update the database instead.`
   );
  }
  this.dataBase.setData<ZeneithDatabaseSchema>("databases", data.databaseName, {
   collectionCount: data.collections.length,
   creationData: data,
  });
  const database = new DataBase(data);
  await database.$create();
  return database;
 },

 async updateDatBaseData(data: ZeneithDatabaseCreationData) {
  await this.dataBase.setData<ZeneithDatabaseSchema>(
   "databases",
   data.databaseName,
   {
    collectionCount: data.collections.length,
    creationData: data,
   }
  );
 },

 async getDataBase(dataBasename: string) {
  if (this.loadedDatabases[dataBasename]) {
   return this.loadedDatabases[dataBasename];
  }

  await this.dataBase.open();

  const dataBaseCheck = await this.dataBase.getData<ZeneithDatabaseSchema>(
   "databases",
   dataBasename
  );

  if (!dataBaseCheck) {
   throw new Error(
    `The database ${dataBasename} does not exists inside of ZeneithDB.`
   );
  }

  const database = new DataBase(dataBaseCheck.creationData);

  this.loadedDatabases[dataBasename] = database;
  return database;
 },

 async dataBaseExist(dataBasename: string): Promise<boolean> {
  const check = await this.dataBase.getData("databases", dataBasename);
  if (!check) {
   return false;
  } else {
   return true;
  }
 },

 async deleteDataBase(dataBasename: string) {
  await this.dataBase.open();
  const check = await this.dataBase.getData<ZeneithDatabaseSchema>(
   "databases",
   dataBasename
  );
  if (!check) {
   return false;
  }
  this.dataBase.removeData("databases", dataBasename);
  for (const collection of check.creationData.collections) {
   await this.dataBase.removeData(
    "collections",
    `${dataBasename}-${collection.name}`
   );
  }
  indexedDB.deleteDatabase(dataBasename);
 },
};
