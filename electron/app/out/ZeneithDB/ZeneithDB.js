import { ZeneithDBCore } from "./ZeneithDBCore.js";
export const ZeneithDB = {
    __version: 0.1,
    core: new ZeneithDBCore(),
    $INIT: async function () {
        await this.core.initialize();
    },
    databaseExists: async function (dataBaseName) {
        return await this.core.checkIfDatabaseExists(dataBaseName);
    },
    createDatabase: async function (data) {
        const database = await this.core.createDatabase(data);
        console.log(database);
        return database;
    },
    updateDatabase: function (data) {
        return this.core.createDatabase(data);
    },
    getDatabase: function (name) {
        return this.core.getDatabase(name);
    },
    deleteDatabase: function (name) { },
};
ZeneithDB.core.zeneith = ZeneithDB;
