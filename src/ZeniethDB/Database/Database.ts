import { ZeneithDatabaseCreationData } from "ZeniethDB/Meta/Database/Database.types";
import {
 ZeneithSchema,
 ZeneithSchemaNode,
 ZeneithSchemaNodes,
} from "ZeniethDB/Meta/Database/Schema.types";

export class DataBase {
 dataBaseVersion = 2;
 dataBaseName = "";

 opened = false;

 db = <IDBDatabase | null>null;

 constructor(
  public creationData: ZeneithDatabaseCreationData,
  public outsideZeneith: boolean = false
 ) {
  this.dataBaseName = this.creationData.databaseName;
 }

 isOpen() {
  return this.opened;
 }

 open() {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName);
   const self = this;
   request.onerror = function (event) {
    console.warn("Error when opening IndexDB");
    reject(false);
   };
   request.onsuccess = function (event) {
    //@ts-ignore
    self.db = request.result;
    self.opened = true;
    resolve(true);
   };
  });
  return prom;
 }

 close() {
  if (!this.db) {
   return false;
  }
  this.db.close();
  this.db = null;
  return true;
 }

 async forceUpdate() {
  let version = await this.getDatabaeVersion();

  const self = this;

  const request = window.indexedDB.open(this.dataBaseName, version + 1);

  request.onerror = function (event) {
   console.warn("Error when opening IndexDB");
  };
  request.onupgradeneeded = async function (event) {
   const db: IDBDatabase = request.result;

   self.db = db;

   for (const collectionData of self.creationData.collections) {
    if (!self.outsideZeneith) {
     //add collections to zeneith
    }

    const checkCollection = self.doesCollectionExists(collectionData.name);
    let collection: IDBObjectStore;

    if (checkCollection) {
     const transaction = request.transaction;
     const store = (transaction as any).objectStore(collectionData.name);
     collection = store;

    } else {
     collection = db.createObjectStore(collectionData.name);
    }

    self._processCollectionScehma(collection, collectionData.schema);
   }
  };

  request.onsuccess = function (event) {
   if (!self.opened) {
    request.result.close();
   }
  };
 }

 _processCollectionScehma(collection: IDBObjectStore, schema: ZeneithSchema) {
  this.__traverseColletionScehma(collection, schema);
 }

 __traverseColletionScehma(collection: IDBObjectStore, schema: ZeneithSchema) {
  for (const node of schema) {
   if (Array.isArray(node)) {
    this.__traverseColletionScehma(collection, node as any);
    continue;
   }
   if (node.index) {
    collection.createIndex(node.name, node.name, { unique: node.isUnique });
   }
   if (node.children) {
    this.__traverseColletionScehma(collection, node.children as any);
   }
  }
 }

 getDatabaeVersion() {
  const prom: Promise<number> = new Promise((resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName);
   request.onsuccess = function (event) {
    const version = request.result.version;
    request.result.close();
    resolve(version);
   };
   request.onerror = function (event) {
    console.warn("Error when opening IndexDB");
    reject("Error when opening IndexDB");
   };
  });
  return prom;
 }

 doesCollectionExists(collectionName: string): boolean {
  if (!this.db) {
   throw new Error(`Database ${this.dataBaseName} is not opened.`);
  }
  if (this.db.objectStoreNames.contains(collectionName)) {
   return true;
  } else {
   return false;
  }
 }

 getData<T>(collectionName: string, key: string): Promise<T | false> {
  const prom: Promise<T | false> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readonly");
   const objectStore = transaction.objectStore(collectionName);
   const request: IDBRequest<T> = objectStore.get(key);
   request.onerror = function (event) {
    transaction.commit();
    reject(false);
   };
   request.onsuccess = function (event) {
    transaction.commit();
    resolve(request.result);
   };
  });
  return prom;
 }

 removeData(collectionName: string, key: string): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const request = this.db
    .transaction([collectionName], "readwrite")
    .objectStore(collectionName)
    .delete(key);
   request.onerror = function (event) {
    reject(false);
   };
   request.onsuccess = function (event) {
    resolve(true);
   };
  });
  return prom;
 }

 setData(collectionName: string, key: string, setData: any): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const objectStore = this.db
    .transaction([collectionName], "readwrite")
    .objectStore(collectionName);

   const requestUpdate = objectStore.put(setData, key);
   requestUpdate.onerror = function (event) {
    reject(false);
   };
   requestUpdate.onsuccess = function (event) {
    resolve(true);
   };
  });
  return prom;
 }

 updateData(
  collectionName: string,
  key: string,
  updateData: any
 ): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const objectStore = this.db
    .transaction([collectionName], "readwrite")
    .objectStore(collectionName);
   objectStore.getAll();
   const request = objectStore.get(key);
   request.onerror = function (event) {
    reject(false);
   };
   request.onsuccess = function (event) {
    //@ts-ignore
    const data = event.target.result;

    for (const key of Object.keys(updateData)) {
     data[key] = updateData[key];
    }

    var requestUpdate = objectStore.put(data);
    requestUpdate.onerror = function (event) {
     reject(false);
    };
    requestUpdate.onsuccess = function (event) {
     resolve(true);
    };
   };
  });
  return prom;
 }
}
