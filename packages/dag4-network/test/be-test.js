const {blockExplorerApi} = require("../dist/cjs/api/block-explorer-api");
const {dagDi} = require("@stardust-collective/dag4-core");
const fetch = require('node-fetch');

dagDi.useFetchHttpClient(fetch);

async function test () {
    //https://www.dagexplorer.io/search?term=DAG2rMPHX4w1cMMjowmewRMjD1in53yRURt6Eijh
    const d = new Date();
    //d.setMinutes(d.getMinutes() - 1);

    console.log(d);
    console.log(d.toLocaleTimeString());

    const results = await blockExplorerApi.getTransactionsByAddress('DAG3buDiD1WVT1Z8q3hDGMiWJYbnJEZv8WCeSmHc', 2);//0, "2020-12-24T01:57:00Z")

    console.log(JSON.stringify(results,null,' '));

    console.log(results.length);
}

test();
