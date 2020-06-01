# apify-tutorial
Hi there! Here I'm gonna put answers for every tutorial quiz and my thoughts :)

#Tutorial II - Apify SDK
######Where and how can you use JQuery with the SDK?
We use Cheerio - the server side implementation of JQuery. Concerning the question, theoretical we can use JQuery in PuppeteerCrawler within "evaluate()"
######What is the main difference between Cheerio and JQuery?
Cheerio does not need a browser and uses "document" as a default context. We can change context of Cheerio by providing 2 arguments. JQuery attaches to DOM, Cheerio uses the bypasses HTML as a string (in the case of Apify SDK it goes under the hood)
######When would you use CheerioCrawler and what are its limitations?
When I'm working on the site which is simple and does not require rendering. The main limitation of CheerioCrawler is that we cannot manipulate with JS and use plain HTTP requests for crawling purposes
######What are the main classes for managing requests and when and why would you use one instead of another?
The main classes for requests are:
 - Request - the class which has at least a link to be visited by the crawler, can include a lot more information. We must use this class, there is no choice as far as I can see for now (only if we hard-code the link within the crawler haha)
 - RequestList - the class which consists of the initial input data (e.g. array of initial links or data as in the example of CheerioCrawler) -  we should use when it makes sense to have a pre-defined list of tasks which are gonna be some kind of "entry data" for the crawling process (to start from)
 - RequestQueue - the class which handles queueing of requests, works as a regular queue, obviously can be dynamically updated within "handlePageFunction()" - make sense to use when there is a dynamic embedded crawling process (in most of the cases) when the pool of tasks is growing as we go "in depth" on the crawled site
######How can you extract data from a page in Puppeteer without using JQuery?
I can use plain JS such as querySelectorAll(), getElementById() within "evaluate()" or use Puppeteer's sugar such as "page.$$()", "page.$()", "page.$eval()", page.$$eval()"
######What is the default concurrency/parallelism the SDK uses?
Default values are 1 (minConcurrency) and 1000(maxConcurrency)
######p.s.
1. Seems there is a wrong description "to crawl a list of URLs from an external file" should be "to crawl a list of URLs from a pre-defined RequestList" because we use "Apify.getInput()" to load data from the outside. Am I right?
```https://sdk.apify.com/docs/examples/cheerio-crawler```
