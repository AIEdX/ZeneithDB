import { ZeneithDBCore } from "./ZeneithDBCore.js";
export const ZeneithDB = {
    __initalized: false,
    core: ZeneithDBCore,
    async $INIT() {
        if (this.__initalized)
            return;
        await this.core.initialize();
        this.__initalized = true;
    },
    async databaseExists(dataBaseName) {
        return await this.core.dataBaseExist(dataBaseName);
    },
    async createDatabase(data) {
        return this.core.createDataBase(data);
    },
    async updateDatabase(data) {
        return this.core.createDataBase(data);
    },
    async getDatabase(name) {
        return this.core.getDataBase(name);
    },
    async deleteDatabase(name) {
        return this.core.deleteDataBase(name);
    },
};
