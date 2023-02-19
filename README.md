<h1 align="center">
   ZeneithDB
</h1>

<p align="center">
<img src="https://i.ibb.co/cXHYWS3/zeneithdbsmall.png" alt="zeneithdbsmall" border="0">
</p>

---
This is a simple library for interacting with indexDB. 

It keeps tracks of databases for you and makes it easy to upgrade and delete databases as well as do basic CRUD operations. 

```ts
import { ZeneithDB } from "ZeneithDB";
import type { DataBase, ZeneithDatabaseCreationData } from "ZeneithDB";
(async () => {
 await ZeneithDB.$INIT();
 const dbName = "zeneith-example-one";
 const dbData: ZeneithDatabaseCreationData = {
  databaseName: dbName,
  collections: [
   {
    name: "collection1",
    schema: [
     {
      name: "id",
      valueType: "string",
      index: true,
      isUnique: true,
     },
    ],
   },
  ],
 };
 const existanceCheck = await ZeneithDB.databaseExists(dbName);
 let database: DataBase;
 if (!existanceCheck) {
  database = await ZeneithDB.createDatabase(dbData);
 } else {
  database = await ZeneithDB.getDatabase(dbName);
 }
 await database.open();
 await database.setData("collection1", "test-1", {
  data1: {
   key: "1",
  },
  data2: {
   key: "2",
  },
 });
 const data = await database.getData("collection1", "test-1");
 document.body.innerText = JSON.stringify(data, undefined, 4);
 database.close();
})();
```
