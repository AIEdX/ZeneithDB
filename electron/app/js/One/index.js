import { ZeneithDB } from "../../../out/index.js";
(async () => {
    await ZeneithDB.$INIT();
    const dbName = "zeneith-example-one";
    const dbData = {
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
    let database;
    if (!existanceCheck) {
        database = await ZeneithDB.createDatabase(dbData);
    }
    else {
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
