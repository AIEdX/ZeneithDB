import { ZeneithDatabaseCreationData } from "ZeneithDB/Meta/Database/Database.types";
import {
 ZeneithSchema,
 ZeneithSchemaNode,
 ZeneithSchemaNodes,
} from "ZeneithDB/Meta/Database/Schema.types";

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
  return this.opened && this.db !== null;
 }

 open(): Promise<boolean> | true {
  if (this.isOpen()) return true;
  const self = this;
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName);
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

 close(): boolean {
  if (!this.db) {
   return false;
  }
  this.db.close();
  this.db = null;
  return true;
 }

 async forceUpdate() {
  const self = this;
  const prom: Promise<boolean> = new Promise(async (resolve, reject) => {
   let version = await this.getDatabaeVersion();

   const request = window.indexedDB.open(this.dataBaseName, version + 1);

   request.onerror = (event) => {
    reject(false);
    throw new Error(`Error opening ${self.dataBaseName}.`);
   };

   request.onupgradeneeded = async (event) => {
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

   request.onsuccess = (event) => {
    if (!self.opened) {
     request.result.close();
    }
    resolve(true);
   };
  });
  return prom;
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

 updateCollectionScehma(collectionName: string, scehma: ZeneithSchema) {}

 addNewCollection(collectionName: string, scehma: ZeneithSchema) {}

 removeCollection(collectionName: string, scehma: ZeneithSchema) {}

 getDatabaeVersion() {
  const prom: Promise<number> = new Promise((resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName);
   request.onsuccess = (event) => {
    const version = request.result.version;
    request.result.close();
    resolve(version);
   };
   request.onerror = (event) => {
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
   request.onerror = (event) => {
    reject(false);
    transaction.commit();
   };
   request.onsuccess = (event) => {
    if (!request.result) {
     resolve(false);
    } else {
     resolve(request.result);
    }
    transaction.commit();
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
   request.onerror = (event) => {
    reject(false);
   };
   request.onsuccess = (event) => {
    resolve(true);
   };
  });
  return prom;
 }

 setData<T>(collectionName: string, key: string, setData: T): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const objectStore = this.db
    .transaction([collectionName], "readwrite")
    .objectStore(collectionName);

   const requestUpdate = objectStore.put(setData, key);
   requestUpdate.onerror = (event) => {
    reject(false);
   };
   requestUpdate.onsuccess = (event) => {
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
   request.onerror = (event) => {
    reject(false);
   };
   request.onsuccess = (event) => {
    //@ts-ignore
    const data = event.target.result;

    for (const key of Object.keys(updateData)) {
     data[key] = updateData[key];
    }

    var requestUpdate = objectStore.put(data);
    requestUpdate.onerror = (event) => {
     reject(false);
    };
    requestUpdate.onsuccess = (event) => {
     resolve(true);
    };
   };
  });
  return prom;
 }
}
