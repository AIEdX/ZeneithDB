export class DataBase {
    creationData;
    outsideZeneith;
    dataBaseVersion = 2;
    dataBaseName = "";
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
    open() {
        if (this.isOpen())
            return true;
        const self = this;
        const prom = new Promise((resolve, reject) => {
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
    close() {
        if (!this.db) {
            return false;
        }
        this.db.close();
        this.db = null;
        return true;
    }
    async forceUpdate() {
        const self = this;
        const prom = new Promise(async (resolve, reject) => {
            let version = await this.getDatabaeVersion();
            const request = window.indexedDB.open(this.dataBaseName, version + 1);
            request.onerror = (event) => {
                reject(false);
                throw new Error(`Error opening ${self.dataBaseName}.`);
            };
            request.onupgradeneeded = async (event) => {
                const db = request.result;
                self.db = db;
                for (const collectionData of self.creationData.collections) {
                    if (!self.outsideZeneith) {
                        //add collections to zeneith
                    }
                    const checkCollection = self.doesCollectionExists(collectionData.name);
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
    updateCollectionScehma(collectionName, scehma) { }
    addNewCollection(collectionName, scehma) { }
    removeCollection(collectionName, scehma) { }
    getDatabaeVersion() {
        const prom = new Promise((resolve, reject) => {
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
    doesCollectionExists(collectionName) {
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
        const prom = new Promise((resolve, reject) => {
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
    removeData(collectionName, key) {
        const prom = new Promise((resolve, reject) => {
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
    setData(collectionName, key, setData) {
        const prom = new Promise((resolve, reject) => {
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
    updateData(collectionName, key, updateData) {
        const prom = new Promise((resolve, reject) => {
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
