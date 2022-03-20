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
        return this.opened;
    }
    open() {
        const prom = new Promise((resolve, reject) => {
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
        request.onsuccess = function (event) {
            if (!self.opened) {
                request.result.close();
            }
        };
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
    getDatabaeVersion() {
        const prom = new Promise((resolve, reject) => {
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
    removeData(collectionName, key) {
        const prom = new Promise((resolve, reject) => {
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
    setData(collectionName, key, setData) {
        const prom = new Promise((resolve, reject) => {
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
