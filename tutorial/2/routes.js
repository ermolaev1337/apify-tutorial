const Apify = require('apify');
const {utils: {log}} = Apify;

exports.SEARCH_PAGE = async ({page, request}, {requestQueue}) => {
    log.info('Crawling ASINs on the search page');
    const asins = await page.$$eval('div[data-asin]', $divs => {
        const output = [];
        $divs.forEach($div => {
            const asin = $div.getAttribute('data-asin');
            asin && output.push(asin)
        });
        return output
    });
    log.debug(`List of ASINs ${asins}`);
    if (asins.length === 0) {
        log.warning('No ASINs scrapped');
        return;
    }
    await Promise.all(asins.map(asin => {
        requestQueue.addRequest({
            url: `https://www.amazon.com/dp/${asin}`,
            userData: {
                label: 'ITEM_PAGE',//would be nice to extract this string for re-usability
                keyword: request.userData.keyword,
                asin,
            }
        });
    }))
};

exports.ITEM_PAGE = async ({page, request}, {requestQueue}) => {
    log.info(`Crawling item details ${request.url}`);
    const itemData = {
        url: request.url,
        title: await page.$eval('meta[name="title"]', $meta => $meta.getAttribute('content')),
        description: await page.$eval('meta[name="description"]', $meta => $meta.getAttribute('content')),
        keyword: request.userData.keyword,
    };
    log.debug(`Item details crawled ${JSON.stringify(itemData)}`);

    await requestQueue.addRequest({
        url: `https://www.amazon.com/gp/offer-listing/${request.userData.asin}`,
        userData: {
            label: 'OFFER_PAGE',//would be nice to extract this string for re-usability
            itemData,
        }
    });
};

exports.OFFER_PAGE = async ({page, request}) => {
    log.info(`Crawling item offers ${request.url}`);
    const offerData = await page.$$eval('div[role="row"].olpOffer', $rows => {// btw it's better to polish selectors
        const output = [];
        $rows.forEach($row => output.push({//better to extract to a helper file and split all this redundant code into chunks and handle with a pipe
                sellerName: $row.querySelector('h3 > span > a') &&
                    $row.querySelector('h3 > span > a').textContent.trim(),
                price: $row.querySelector('div.olpPriceColumn > span') &&
                    /[0-9\.$]+/g.exec($row.querySelector('div.olpPriceColumn > span').textContent.trim()) &&
                    /[0-9\.$]+/g.exec($row.querySelector('div.olpPriceColumn > span').textContent.trim()) [0],
                shippingPrice: $row.querySelector('p.olpShippingInfo') &&
                    /(FREE|[0-9\.$]+)/g.exec($row.querySelector('p.olpShippingInfo').textContent) &&
                    /(FREE|[0-9\.$]+)/g.exec($row.querySelector('p.olpShippingInfo').textContent)[0],
            })
        )
        return output
    });
    log.debug(`Item offers crawled ${JSON.stringify(offerData)}`);

    const output = [//better to extract to tools aas well
        ...offerData.map(offer => ({
            ...offer,
            ...request.userData.itemData
        }))
    ]
    await Apify.pushData(output);
    if (output.length>1)//roughly prevent spamming by empty arrays
        await Apify.call('apify/send-mail', {// let's put it simple for now but it's better to send all the messages as an array once the queue is empty
            to: "lukas@apify.com",
            subject: 'This is for the Apify SDK exercise',
            html: `<p>${JSON.stringify(output)}</p>`,
        });
};