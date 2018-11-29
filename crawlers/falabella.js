/*function CrawlerFalabella2(ctx, req) {
	var ctx = ctx || null;
	var req = req || null;
	var client = null;
	var page = null;

	if(ctx == null) {
		return new Error('Ctx object is required');
	}

	if(req == null) {
		throw ctx.throw(500, JSON.stringify({some: "data"}), { expose: true })
	}

	setClient => (client) {
		this.client = client; 
	}

	this.getResults => () {
		page = this.client.newPage();
		await page.goto()
	}
}*/

class CrawlerFalabella {

	constructor(ctx, req) {
		if(ctx==null) {
			throw new Error('Ctx object is required');
		} else {
			this.ctx = ctx;
		}

		if(req==null) {
			throw new  Error('request is empty');
		} else {
			this.req = req;
		}
		this.domainUrl = 'https://www.falabella.com.ar';
		this.entry_point = 'https://www.falabella.com.ar/falabella-ar/search/?Ntt=';
	}

	setClient(client) {
		this.client = client;
	}

	async getResults() {
		/*this.page = this.client.newPage();
		await this.page.goto(this.entry_point+ encodeURI(this.req.query));
		await this.page.screenshot({path:'sample.png'});

		await this.client.close();*/
		const viewPort = {width:1280, height:960};
		const page = await this.client.newPage();
		await page.goto(this.entry_point+ encodeURI(this.req.query));
		await page.setViewport(viewPort);

		const teams = await page.evaluate(() => {
				const data = [];
				for (const tr of document.querySelectorAll('.pod-head__image')) {
					data.push({
						url: tr.getAttribute('href'),
					})
				}
		      return data
		    });
		console.log('RESULTS');
		let resultsData = [];
		for(let i in teams) {
			const item = teams[i];
			//console.log('Navigate in '+this.domainUrl+item.url);
			console.log(item);
			await page.goto(this.domainUrl+item.url);
			const pageData = await page.evaluate(() => {
				resultsItem = [];
				let imagesUrl = [];
				document.querySelectorAll('.fb-pp-gallery-list li img').forEach(img => imagesUrl.push(img.getAttribute('src')) );

				let productsRelated = [];
				document.querySelectorAll('.fb-pod-group__item a').forEach(a => productsRelated.push(a.getAttribute('href')) );

				const cat_uid = document.querySelectorAll('.fb-masthead__breadcrumb__link').length ? document.querySelectorAll('.fb-masthead__breadcrumb__link')[document.querySelectorAll('.fb-masthead__breadcrumb__link').length-1].innerText.replace('/','').trim().replace(new RegExp(' ', 'g'), '-') : null;
				console.log(cat_uid)
				const dt = {
					title: document.querySelector('.fb-product-cta__title') ? document.querySelector('.fb-product-cta__title').innerText : null,
					brand: document.querySelector('.fb-product-cta__brand') ? document.querySelector('.fb-product-cta__brand').innerText : null,
					sku: document.querySelector('.fb-product-sets__product-code') ? document.querySelector('.fb-product-sets__product-code').innerText.trim().replace('Código del producto: ','') : null,
					price: document.querySelectorAll('.fb-price')[0] ? document.querySelectorAll('.fb-price')[0].innerText.trim().split(' ')[1] : null,
					//price_promotion: document.querySelectorAll('.fb-price')[0] ? document.querySelectorAll('.fb-price')[0].innerText.trim().split(' ')[1] : null,
					category: cat_uid,
					description: document.querySelector('.fb-product-information') ? document.querySelector('.fb-product-information').innerText : null,
					images:imagesUrl,
					products_related: productsRelated,
					category_query:cat_uid
				};
				if (document.querySelectorAll('.fb-price')[1]) {
					dt.price_promotion = dt.price;
					dt.price =  document.querySelectorAll('.fb-price')[1].innerText.trim().split(' ')[1];
				}
				resultsItem.push(dt);
			//	console.log(dt);
				return resultsItem;
			});
			resultsData.push(pageData[0]);
			//console.log(resultsData);
			//await page.screenshot({path:'./screenshots/'+encodeURI(item.title)+'.png'});
		}
		console.log(resultsData);

		await this.client.close();
		return resultsData;
	}

};


module.exports = CrawlerFalabella;