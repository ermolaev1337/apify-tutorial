const Apify = require('apify');
const routes = require('./routes');
const {utils: {log}} = Apify;

exports.getSources = async () => {
    log.debug('Getting sources');
    const input = await Apify.getInput();
    if (input.length === 0) {//let's at least handle empty input
        throw new Error('No input');
    }
    const keyword = input.keyword;
    /*
    Actually there are gonna be more comprehensive inputs (at leas arrays of keywords). So, filtering/mapping will make
    sense as well as logging warnings for such cases
     */
    return [{
        url: `https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=${keyword}`,
        userData:
            {
                label: 'SEARCH_PAGE',
                keyword
            }
    }]
};

exports.createRouter = globalContext => {
    return async function (routeName, requestContext) {
        const route = routes[routeName];
        if (!route) throw new Error(`No route for name: ${routeName}`);
        log.debug(`Invoking route: ${routeName}`);
        return route(requestContext, globalContext);
    };
};