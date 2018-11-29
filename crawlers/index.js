
"use strict";


const falabella = require('./falabella');
const mercadolibre = require('./mercadolibre');

exports.getProvider = async function(ctx, req) {
	let provider = null;
	switch(req.provider)
	{
		case 'falabella':
			provider = new falabella(ctx, req);
			//console.log(provider);
			//provider.setClient();
		break;
		case 'mercadolibre':
			provider = new mercadolibre(ctx, req);
		break;
	}
	return provider;
};