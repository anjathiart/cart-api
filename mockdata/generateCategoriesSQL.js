let fs = require('fs');
let filename = 'fakeCategories.json'
let categories = JSON.parse(fs.readFileSync(filename,'utf8'));

let columns = Object.keys(categories[0]).join(', ');

let query = `INSERT INTO categories(${columns}) VALUES `

let values = categories.map(category => {
	return `(\'${Object.values(category).join("\', \'")}\')`
})

query += values.join(', ')

console.log(query);