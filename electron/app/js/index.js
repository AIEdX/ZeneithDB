import { ZeneithDB } from "../../out/index.js";
(async () => {
    await ZeneithDB.$INIT();
    console.log("hello");
    const database = await ZeneithDB.createDatabase({
        databaseName: "zeneith-example-one",
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
    });
    console.log(database);
})();
