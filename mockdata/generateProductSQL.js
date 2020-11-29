let fs = require('fs');
let filename = 'fakeProducts.json'
let products = JSON.parse(fs.readFileSync(filename,'utf8'));

let columns = Object.keys(products[0]).join(', ');


let query = `INSERT INTO products(${columns}) VALUES `

let values = products.map(product => {
	return `(\'${Object.values(product).join("\', \'")}\')`
})

query += values.join(', ')

console.log(query);