let fs = require('fs');
let parsedJson = JSON.parse(fs.readFileSync('fakestoreapi.json','utf8'));

let data = [];
for (let i = 0; i < 10; i += 1) {
	data.push(parsedJson[i])
}

/* utility functions */

// generate mock sku
let skuPostfixNum = 10000;
const skuPrefix = 'FK-SKU-'
const getSKU = () => {
	skuPostfixNum += 1;
	return `${skuPrefix}${skuPostfixNum}` ;
}

const generageStockLevel = () => {
	const [min, max] = [0, 200];
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate / retrieve category info
let categoriesCount = 0;
let categories = []; // { categoryIndex: 0, categoryName: '' }
const getCategoryIndex = (category) => {

	let filteredCategories = categories.filter((el) => {
		return el.categoryName === category;
	});

	if (filteredCategories.length > 0) {
		return filteredCategories[0].categoryIndex
	} else {
		categoriesCount += 1;
		categories.push({
			categoryIndex: categoriesCount,
			categoryName: category,
		});
		return categoriesCount;
	}
}


// products table schema map
let productSchema = {
	productSKU: {
		fakestore: false,
		default: () => getSKU(),
	},
	productDescription: {
		fakestore: 'description',
		default: '',
	},
	productImageUrl: {
		fakestore: 'image',
	},
	productTitle: {
		fakestore: 'title',
		default: 'Unknown',
	},
	categoryIndex: {
		fakestore: (category) => getCategoryIndex(category),
	},
	productCurrency: {
		fakestore: false,
		default: 'USD',
	},
	productPrice: {
		fakestore: 'price',
		default: 0.00,
	},
	productStockLevel: {
		fakestore: false,
		default: () => generageStockLevel()
	},
	productUpdated: {
		fakestore: false,
		default: () => Math.floor(new Date() / 1000),
	},
	productHasExpiryDate: {
		fakestore: false,
		default: 0,
	},
	productExpiryDate: {
		fakestore: false,
		default: 0,
	}
}

// build product data in products table format
let products = [];
for (let i = 0; i < data.length; i += 1) {
	let productItem = {};
	Object.keys(productSchema).forEach(key => {
		if (key === 'categoryIndex') {
			productItem[key] = productSchema[key].fakestore(data[i].category);
		} else if (key === 'productSKU') {
			productItem[key] = productSchema[key].default();
		} else if (key === 'productStockLevel') {
			productItem[key] = productSchema[key].default();
		} else if (key === 'productUpdated') {
			productItem[key] = productSchema[key].default();
		} else {
			productItem[key] = productSchema[key].fakestore ? data[i][productSchema[key].fakestore] : productSchema[key].default
		}

		if (typeof productItem[key] === 'string') {
			productItem[key] = productItem[key].replace(/'/g, "\\'")
		}
	});
	products.push(productItem);
}


// write product data 
fs.writeFile(`fakeProducts.json`, JSON.stringify(products), 'utf8', () => {
	console.log('done');
});

// write category data 
fs.writeFile(`fakeCategories.json`, JSON.stringify(categories), 'utf8', () => {
	console.log('done');
});




