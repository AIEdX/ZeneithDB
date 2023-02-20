import { ZeneithDBCore } from "../ZeneithDBCore.js";
import { ZeneithUtil } from "../ZeneithUtil.js";
export class DataBase {
    creationData;
    outsideZeneith;
    dataBaseName = "";
    util = ZeneithUtil;
    opened = false;
    db = null;
    constructor(creationData, outsideZeneith = false) {
        this.creationData = creationData;
        this.outsideZeneith = outsideZeneith;
        this.dataBaseName = this.creationData.databaseName;
    }
    isOpen() {
        return this.opened && this.db !== null;
    }
    getUUID() {
        return ZeneithUtil.getUUID();
    }
    open() {
        if (this.isOpen())
            return true;
        const self = this;
        const prom = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dataBaseName);
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
        this.opened = false;
        this.db.close();
        this.db = null;
        return true;
    }
    _openAtVersion(version = 1) {
        const self = this;
        const prom = new Promise(async (resolve, reject) => {
            const request = indexedDB.open(this.dataBaseName, version);
            request.onerror = (event) => {
                reject(false);
                console.log(event);
                throw new Error(`Error opening ${self.dataBaseName}.`);
            };
            request.onblocked = () => {
                console.log("blocked at version");
                reject(false);
            };
            request.onsuccess = (event) => {
                self.db = request.result;
                self.opened = true;
                resolve(true);
            };
        });
        return prom;
    }
    async $create() {
        await this.forceUpdate(undefined, true);
    }
    async forceUpdate(removeCollections, newDB = false) {
        const self = this;
        let version = newDB ? 1 : await this.getDatabaeVersion();
        if (this.opened) {
            this.close();
        }
        const prom = new Promise(async (resolve, reject) => {
            const request = indexedDB.open(this.dataBaseName, version + 1);
            request.onerror = (event) => {
                reject(false);
                console.log(event);
                throw new Error(`Error opening ${self.dataBaseName}.`);
            };
            request.onblocked = (event) => {
                console.log("blocked");
                console.log(event);
                reject(false);
            };
            request.onupgradeneeded = (event) => {
                const db = request.result;
                self.db = db;
                if (!self.outsideZeneith) {
                    ZeneithDBCore.updateDatBaseData(self.creationData);
                }
                if (removeCollections) {
                    for (const collectionName of removeCollections) {
                        db.deleteObjectStore(collectionName);
                    }
                }
                for (const collectionData of self.creationData.collections) {
                    const checkCollection = self.doesCollectionExist(collectionData.name);
                    let collection;
                    if (checkCollection) {
                        const transaction = request.transaction;
                        const store = transaction.objectStore(collectionData.name);
                        collection = store;
                    }
                    else {
                        collection = db.createObjectStore(collectionData.name);
                    }
                    self._processCollectionScehma(collection, collectionData.schema);
                }
                resolve(true);
            };
            request.onsuccess = (event) => {
                self.db = request.result;
                self.opened = true;
            };
        });
        return prom;
    }
    _processCollectionScehma(collection, schema) {
        this.__traverseColletionScehma(collection, schema);
    }
    __traverseColletionScehma(collection, schema) {
        for (const node of schema) {
            if (Array.isArray(node)) {
                this.__traverseColletionScehma(collection, node);
                continue;
            }
            if (node.index) {
                collection.createIndex(node.name, node.name, { unique: node.isUnique });
            }
            if (node.children) {
                this.__traverseColletionScehma(collection, node.children);
            }
        }
    }
    async addNewCollection(collectionName, scehma) {
        try {
            this.creationData.collections.push({
                name: collectionName,
                schema: scehma,
            });
            await this.forceUpdate();
            return true;
        }
        catch (error) {
            console.log(`Failed making a new collection with the name ${collectionName}`);
            console.error(error);
            return false;
        }
    }
    async removeCollection(collectionName) {
        try {
            let deleteCollections = [];
            if (typeof collectionName == "string") {
                deleteCollections.push(collectionName);
            }
            else {
                deleteCollections.push(...collectionName);
            }
            const collections = [];
            for (const collection of this.creationData.collections) {
                if (!deleteCollections.includes(collection.name)) {
                    collections.push(collection);
                }
            }
            this.creationData.collections = collections;
            await this.forceUpdate(deleteCollections);
            return true;
        }
        catch (error) {
            console.log(`Failed making a new collection with the name ${collectionName}`);
            console.error(error);
            return false;
        }
    }
    getDatabaeVersion() {
        const prom = new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dataBaseName);
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
    doesCollectionExist(collectionName) {
        if (!this.db) {
            throw new Error(`Database ${this.dataBaseName} is not opened.`);
        }
        if (this.db.objectStoreNames.contains(collectionName)) {
            return true;
        }
        else {
            return false;
        }
    }
    getData(collectionName, key) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
            if (!this.db) {
                throw new Error(`Database ${this.dataBaseName} is not opened.`);
            }
            const transaction = this.db.transaction([collectionName], "readonly");
            const objectStore = transaction.objectStore(collectionName);
            const request = objectStore.get(key);
            request.onerror = (event) => {
                reject(false);
                transaction.commit();
            };
            request.onsuccess = (event) => {
                if (!request.result) {
                    resolve(false);
                }
                else {
                    resolve(request.result);
                }
                transaction.commit();
            };
        });
        return prom;
    }
    getAllData(collectionName) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
            if (!this.db) {
                throw new Error(`Database ${this.dataBaseName} is not opened.`);
            }
            const transaction = this.db.transaction([collectionName], "readonly");
            const request = transaction
                .objectStore(collectionName)
                .getAll();
            request.onerror = (event) => {
                reject(false);
                transaction.commit();
            };
            request.onsuccess = (event) => {
                if (!request.result) {
                    resolve(false);
                }
                else {
                    resolve(request.result);
                }
                transaction.commit();
            };
        });
        return prom;
    }
    getAllKeys(collectionName) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
            if (!this.db) {
                throw new Error(`Database ${this.dataBaseName} is not opened.`);
            }
            const transaction = this.db.transaction([collectionName], "readonly");
            const request = transaction
                .objectStore(collectionName)
                .getAllKeys();
            request.onerror = (event) => {
                reject(false);
                transaction.commit();
            };
            request.onsuccess = (event) => {
                if (!request.result) {
                    resolve(false);
                }
                else {
                    resolve(request.result);
                }
                transaction.commit();
            };
        });
        return prom;
    }
    removeData(collectionName, key) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
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
    removeAllData(collectionName) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
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
    setData(collectionName, key, setData) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
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
    updateData(collectionName, key, updateFunction) {
        const prom = new Promise(async (resolve, reject) => {
            if (!this.isOpen())
                await this.open();
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
