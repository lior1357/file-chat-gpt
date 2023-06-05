const  redis = require('redis')
const createClient = redis.createClient



const connect = async function() {
    try {
        const client = createClient();
        client.on ('connect', ()=> {
            console.log('Connected!')
        })
        await client.connect();

        console.log(await client.set('key', 'value'));
        
        const myKey = await client.get('key')
        console.log(myKey)

        
        const numAdded = await client.zAdd('vehicles', [
        {
            score: 4,
            value: 'car',
        },
        {
            score: 2,
            value: 'bike',
        },
        ]);

        console.log(`Added ${numAdded} items`);


        for await (const {score, value} of client.zScanIterator('vehicles')) {
            console.log(`${value} --> ${score}`)
        }

        await client.quit()
    } catch(e) {
        console.error(e)
    }
}

connect()