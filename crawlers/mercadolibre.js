
class CrawlerMercadoLibre {

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
		this.domainUrl = 'https://listado.mercadolibre.com.ar';
		this.entry_point = 'https://listado.mercadolibre.com.ar/';
	}

	setClient(client) {
		this.client = client;
	}

	async getResults() {
		
		const viewPort = {width:1280, height:960};
        const page = await this.client.newPage();
        const url = this.entry_point+ this.req.query.replace(new RegExp(' ', 'g'), '-');
		await page.goto(url.toLocaleLowerCase());
		await page.setViewport(viewPort);

		const teams = await page.evaluate(() => {
				const data = [];
				for (const tr of document.querySelectorAll('.rowItem a.item-image')) {
					data.push({
						url: tr.getAttribute('href'),
					})
				}
		      return data
		    });
		console.log('RESULTS for:'+url );
		let resultsData = [];
		for(let i in teams) {
			const item = teams[i];
			console.log(item);
			await page.goto(item.url,{timeout: 0});
			const pageData = await page.evaluate(() => {
				resultsItem = [];
				let imagesUrl = [];
				document.querySelectorAll('.product-gallery img').forEach(img => imagesUrl.push(img.getAttribute('src')) );

				let productsRelated = [];
                document.querySelectorAll('.carousel-common__list a').forEach(a => productsRelated.push(a.getAttribute('href')) );
                //console.log(document.querySelector('.price-tag-fraction').innerText);
                //console.log(document.querySelector('.vip-navigation-breadcrumb-list li a').innerText);
                //console.log(document.querySelector('.item-description').innerText);
				const dt = {
					title: document.querySelector('.item-title__primary') ? document.querySelector('.item-title__primary').innerText : null,
					//sku: document.querySelector('.fb-product-sets__product-code').innerText ? document.querySelector('.fb-product-sets__product-code').innerText : null,
					price: document.querySelector('.price-tag-fraction') ? document.querySelector('.price-tag-fraction').innerText.trim() : null,
					category: document.querySelector('.vip-navigation-breadcrumb-list li a') ? document.querySelector('.vip-navigation-breadcrumb-list li a').innerText.trim().replace(new RegExp(' ', 'g'), '-') : null,
					description: document.querySelector('.item-description') ? document.querySelector('.item-description').innerText.trim() : null,
					images:imagesUrl,
					products_related: productsRelated
				};
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


module.exports = CrawlerMercadoLibre;