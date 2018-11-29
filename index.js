// imports

const koa = require('koa');
const app = new koa();
const bodyParser = require('koa-bodyparser')
const puppeteer = require('puppeteer');
const axios = require('axios');


if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// vars

const ENDPOINT_NOTIFICATION = process.env.ENDPOINT_NOTIFICATION;
const ENDPOINT_AUTH = process.env.ENDPOINT_AUTH;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ACCESS_USER = process.env.ACCESS_USER;
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD;

let accessToken = null;


// logic

const providersCrawlers = require('./crawlers');


// settings

app.use(bodyParser());


// middleware for keep the access token 

app.use((ctx, next) => {
	if (accessToken == null) {
		accessToken = getAccessToken(); 
	}
	return next();
});


// request handler

app.use(async(ctx, next) => {
	try {
		bodyRequest = ctx.request.body;
		params = ctx.request.params;
		const browser =  await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'],headless: false});
		console.log('REQUEST:')
		console.log(bodyRequest);
		
		provider = providersCrawlers.getProvider(ctx, bodyRequest);
		
		provider.then(async crawler  => {
			
			if (crawler == null) {
				ctx.body = 'Bad Request';
				console.log('BAD REQUEST');
				return;
			} 

			crawler.setClient(browser);
			if(typeof(crawler.getResults) == 'undefined') {
				console.log('Crawler Invalid');
				return;
			}
			if (typeof(crawler.makeLogin) == 'function' && hasCredentials(bodyRequest)) {
				await crawler.makeLogin({username:bodyRequest.options.username, password:bodyRequest.options.password})
			}
			
			const results = await crawler.getResults();
			if(results.length > 0) sendNotification(bodyRequest.id, results);

		}).catch(err => {
			console.log('Crawling Error: '+err);
		});
		ctx.body = {success:true};
		
	} catch(err) {
		ctx.body = { message : err.message};
		ctx.status =  400;
	}
});

// function for send external notification

const sendNotification = (id, results) => {
	const axiosConfig = {
		headers: {
			"Content-Type": "application/json",
			"Authorization" : `Bearer ${accessToken}`,
		}
	};

	axios.put(ENDPOINT_NOTIFICATION+'/'+id, results, axiosConfig)
	.then((response) => {
		console.log("NOTIFICATION_SEND");
	}).catch((err) => {
		if (err.response.status == 401) {
			accessToken = getAccessToken();
			sendNotification(id, results);
		}
		console.log('ERROR calling SERVICE_EXTERNAL for: '+err);
	});
}


// function for get access token

const getAccessToken = () => {
	const axiosConfig = {
		headers: {
			"Content-Type": "application/json",
		}
	};
	const axiosBody = {
		user: ACCESS_USER,
		password: ACCESS_PASSWORD,
	};
	
	axios.post(ENDPOINT_AUTH, axiosBody, axiosConfig)
	.then(async (response) => {
		console.log(response.data);
		accessToken = response.data.accessToken;
	}).catch((err) => {
		console.log('ERROR GET ACCESS TOKEN: '+err);
	});
}

const hasCredentials = (body) => {
	return body.options.username!=undefined && body.options.password!=undefined;
}


app.listen(process.env.PORT);