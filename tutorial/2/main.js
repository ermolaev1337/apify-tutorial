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
            stealth: true,
            headless: false,
        },
    });

    await crawler.run();
});