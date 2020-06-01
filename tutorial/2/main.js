const Apify = require('apify');
const {createRouter, getSources} = require('./tools'); //I really fall in love with your arch, it's so pure!
const {utils: {log}} = Apify;
log.setLevel(log.LEVELS.DEBUG);

Apify.main(async () => {
    log.info('Starting Amazon crawling');
    const requestList = await Apify.openRequestList('searches', await getSources());
    const requestQueue = await Apify.openRequestQueue();
    const router = createRouter({requestQueue});

    const crawler = new Apify.PuppeteerCrawler({
        handlePageFunction: async context => {
            const {request} = context;
            log.info(`Crawling ${request.url}`);
            await router(request.userData.label, context)
        },
        requestList,
        requestQueue,
        launchPuppeteerOptions: {
            useChrome: true,
            stealth: true,
            headless: true,
        },
        autoscaledPoolOptions:{
            isFinishedFunction: async ()=>{//lasts forever, how to handle in a better way?
                log.info('All task processed, composing output');
                const dataSet = await Apify.openDataset();
                const output = await dataSet.map(item => item);//map output afterwards according to the expected format
                await Apify.setValue('amazon', output);
            }
        }
    });

    await crawler.run();
});