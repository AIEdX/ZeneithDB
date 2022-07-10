import { ZeneithDatabaseCreationData } from "ZeneithDB/Meta/Database/Database.types";
import {
 ZeneithSchema,
 ZeneithSchemaNode,
 ZeneithSchemaNodes,
} from "ZeneithDB/Meta/Database/Schema.types";
import { ZeneithUtil } from "../ZeneithUtil.js";

export class DataBase {
 dataBaseName = "";
 util = ZeneithUtil;
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

 getUUID() {
  return ZeneithUtil.getUUID();
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

 _openAtVersion(version = 1) {
  const self = this;
  const prom: Promise<boolean> = new Promise(async (resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName, version);

   request.onerror = (event) => {
    throw new Error(`Error opening ${self.dataBaseName}.`);
   };

   request.onblocked = () => {
    console.log("blocked");
   };

   request.onsuccess = (event) => {
    self.db = request.result;
    resolve(true);
   };
  });
  return prom;
 }

 async $create() {
  const self = this;
  await this._openAtVersion(1);
  self.db?.close();
  const prom: Promise<boolean> = new Promise(async (resolve, reject) => {
   const request = window.indexedDB.open(this.dataBaseName, 2);

   request.onerror = (event) => {
    throw new Error(`Error opening ${self.dataBaseName}.`);
   };

   request.onblocked = (event) => {};

   request.onupgradeneeded = async (event) => {
    const db: IDBDatabase = request.result;
    self.db = db;
    const transaction = request.transaction;
    for (const collectionData of self.creationData.collections) {
     db.createObjectStore(collectionData.name);
    }
    transaction?.commit();
    (transaction as any).oncomplete = () => {
        resolve(true);
    }
 
   };

   request.onsuccess = (event) => {};
  });
  return prom;
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

 /*  updateCollectionScehma(collectionName: string, scehma: ZeneithSchema) {}

 addNewCollection(collectionName: string, scehma: ZeneithSchema) {}

 removeCollection(collectionName: string, scehma: ZeneithSchema) {} */

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

 getAllData<T>(collectionName: string): Promise<T[] | false> {
  const prom: Promise<T[] | false> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readonly");
   const request: IDBRequest<T[]> = transaction
    .objectStore(collectionName)
    .getAll();

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

 getAllKeys(collectionName: string): Promise<IDBValidKey[] | false> {
  const prom: Promise<IDBValidKey[] | false> = new Promise(
   (resolve, reject) => {
    if (!this.db) {
     throw new Error(`Database ${this.dataBaseName} is not opened.`);
    }
    const transaction = this.db.transaction([collectionName], "readonly");
    const request: IDBRequest<IDBValidKey[]> = transaction
     .objectStore(collectionName)
     .getAllKeys();

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
   }
  );
  return prom;
 }

 removeData(collectionName: string, key: string): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readwrite");
   const request = transaction.objectStore(collectionName).delete(key);
   request.onerror = (event) => {
    reject(false);
    transaction.commit();
   };
   request.onsuccess = (event) => {
    resolve(true);
    transaction.commit();
   };
  });
  return prom;
 }

 removeAllData(collectionName: string): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readwrite");
   const request = transaction.objectStore(collectionName).clear();
   request.onerror = (event) => {
    reject(false);
    transaction.commit();
   };
   request.onsuccess = (event) => {
    resolve(true);
    transaction.commit();
   };
  });
  return prom;
 }

 setData<T>(collectionName: string, key: string, setData: T): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readwrite");
   const request = transaction.objectStore(collectionName).put(setData, key);

   request.onerror = (event) => {
    reject(false);
    transaction.commit();
   };
   request.onsuccess = (event) => {
    resolve(true);
    transaction.commit();
   };
  });
  return prom;
 }

 updateData<T>(
  collectionName: string,
  key: string,
  updateFunction: (data: T) => T
 ): Promise<boolean> {
  const prom: Promise<boolean> = new Promise((resolve, reject) => {
   if (!this.db) {
    throw new Error(`Database ${this.dataBaseName} is not opened.`);
   }
   const transaction = this.db.transaction([collectionName], "readwrite");
   const objectStore = transaction.objectStore(collectionName);
   const request = objectStore.get(key);

   request.onerror = (event) => {
    reject(false);
   };
   request.onsuccess = (event) => {
    //@ts-ignore
    const data = event.target.result;
    if (!data) {
     resolve(false);
     transaction.commit();
     return;
    }

    const newData = updateFunction(data);

    const requestUpdate = objectStore.put(newData);
    requestUpdate.onerror = (event) => {
     reject(false);
     transaction.commit();
    };
    requestUpdate.onsuccess = (event) => {
     resolve(true);
     transaction.commit();
    };
   };
  });
  return prom;
 }
}
