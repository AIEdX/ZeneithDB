import { DataBase } from "./Database/Database.js";
export class ZeneithDBCore {
    zeneith;
    dataBase;
    async initialize() {
        this.dataBase = new DataBase({
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
        }, true);
        await this.dataBase.open();
        const versionData = await this.dataBase.getData("meta", "main");
        if (!versionData || versionData < this.zeneith.__version) {
            this.dataBase.forceUpdate();
            await this.dataBase.setData("meta", "main", {
                version: this.zeneith.__version,
            });
        }
        this.dataBase.close();
    }
    createDatabase(data) {
        const database = new DataBase(data);
        return database;
    }
}
