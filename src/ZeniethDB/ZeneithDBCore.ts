import { ZeneithDB } from "./ZeneithDB.js";

import { DataBase } from "./Database/Database.js";
import { ZeneithDatabaseCreationData } from "./Meta/Database/Database.types.js";
export class ZeneithDBCore {
 zeneith: typeof ZeneithDB;
 dataBase: DataBase;

 async initialize() {
  this.dataBase = new DataBase(
   {
    databaseName: "ZeneithDB",
    collections: [
     {
      name: "meta",
      schema: [
       {
        name: "version",
        valueType: "number",
       },
      ],
     },
     {
      name: "collections",
      schema: [
       {
        name: "database",
        valueType: "string",
       },
       {
        name: "schema",
        valueType: "any[]",
       },
      ],
     },
     {
      name: "databases",
      schema: [
       {
        name: "name",
        valueType: "string",
       },
       {
        name: "collections",
        valueType: "object",
       },
      ],
     },
    ],
   },
   true
  );

  await this.dataBase.open();
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
 }

 createDatabase(data: ZeneithDatabaseCreationData) {
  const database = new DataBase(data);

  return database;
 }
}
