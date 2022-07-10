import { ZeneithDB } from "./ZeneithDB.js";

import { DataBase } from "./Database/Database.js";
import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
import { ZeneithDatabaseSchema } from "./Meta/Zeneith/Database.schema.js";
import { ZeneithUtil } from "./ZeneithUtil.js";

export class ZeneithDBCore {
 zeneith: typeof ZeneithDB;

 dataBase: DataBase;

 loadedDatabases: Record<string, DataBase> = {};

 util = ZeneithUtil;

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

  await this.dataBase.open();

  const open = async () => {
   const versionData = await this.dataBase.getData<number | false>(
    "meta",
    "main"
   );

   if (!versionData || versionData < this.zeneith.__version) {
    this.dataBase.forceUpdate();
    await this.dataBase.setData("meta", "main", {
     version: this.zeneith.__version,
    });
   }
   this.dataBase.close();
  };

  try {
   await open();
  } catch (error) {
   console.warn("Zeneith Is Being Created.");
   await this.dataBase.$create();
   await open();
  }
 }

 async createDatabase(data: ZeneithDatabaseCreationData) {
  await this.dataBase.open();
  const databaseCheck = await this.dataBase.getData(
   "databases",
   data.databaseName
  );

  if (databaseCheck) {
   throw new Error(
    `The database ${data.databaseName} already exists. Use 'updateDatabase' to update the database instead.`
   );
  }

  for (const collection of data.collections) {
   this.dataBase.setData(
    "collections",
    `${data.databaseName}-${collection.name}`,
    collection.schema
   );
  }

  this.dataBase.setData<ZeneithDatabaseSchema>("databases", data.databaseName, {
   collectionCount: data.collections.length,
   creationData: data,
  });
  const database = new DataBase(data);
  await database.forceUpdate();

  this.dataBase.close();
  return database;
 }

 updateDatabase(data: ZeneithDatabaseCreationData) {
  const database = new DataBase(data);

  return database;
 }

 async getDatabase(dataBasename: string) {
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

  this.dataBase.close();
  const database = new DataBase(dataBaseCheck.creationData);

  this.loadedDatabases[dataBasename] = database;
  return database;
 }

 async checkIfDatabaseExists(dataBasename: string): Promise<boolean> {
  await this.dataBase.open();
  const check = await this.dataBase.getData("databases", dataBasename);
  this.dataBase.close();
  if (!check) {
   return false;
  } else {
   return true;
  }
 }

 async deleteDatabase(dataBasename: string) {
  await this.dataBase.open();
  const check = await this.dataBase.getData<ZeneithDatabaseSchema>(
   "databases",
   dataBasename
  );
  this.dataBase.close();
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
  window.indexedDB.deleteDatabase(dataBasename);
 }
}
