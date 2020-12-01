# shopping-cart
An API for a simple shopping cart application to allow users to interact with their online shopping cart.
Developed with `node v12.19.0` and `mySQL 8.0.22`

## Dev
- Install all npm modules: `npm install` to install or node dependencies
- Run server: `npm run start` to start server in dev mode
- To run tests: `npm run test`
- Sample mysql database can be found in the `resources` folder

## API Reference:

Server errors are returned as status code `500`. For request errors, the response body will contain an array with all applicable error messages.

### Check that the api is responsive

`GET http://127.0.0.1:8444/api/v1/ping`

```
curl --request GET \
  --url http://127.0.0.1:8444/api/v1/ping \
  --header 'content-type: applicatiion/json'
```

### View store products

`GET http://127.0.0.1:8444/api/v1/products`

This endpoint allows the user to add the following query parameters:
- page: page number of results to return
- limit: maximum number of items per page
- priceFrom: filter for prices that are above priceFrom
- priceTo: filter for prices that are below priceTo
- categoryIndex: categoryIndex to filter on
- search: a string that will be matched against product title, description, and category

Certain defaults and max / min values may apply but are taken care of by the api.

#### Request example:

```
curl --request GET \
  --url 'http://127.0.0.1:8444/api/v1/products?page=1&limit=2&priceFrom=10&priceTo=1000&search=j&categoryIndex=4&='
 ```

#### Response: `200 OK`

```json
{
  "page": 1,
  "pageCount": 2,
  "limit": 2,
  "search": "j",
  "data": [
    {
      "productIndex": 47,
      "productTitle": "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
      "productPrice": "29.95 USD",
      "productDescription": "100% POLYURETHANE(shell) 100% POLYESTER(lining) 75% POLYESTER 25% COTTON (SWEATER), Faux leather material for style and comfort / 2 pockets of front, 2-For-One Hooded denim style faux leather jacket, Button detail on waist / Detail stitching at sides, HAND WASH ONLY / DO NOT BLEACH / LINE DRY / DO NOT IRON",
      "categoryName": "women clothing",
      "categoryIndex": 4
    },
    {
      "productIndex": 48,
      "productTitle": "Rain Jacket Women Windbreaker Striped Climbing Raincoats",
      "productPrice": "39.99 USD",
      "productDescription": "Lightweight perfet for trip or casual wear---Long sleeve with hooded, adjustable drawstring waist design. Button and zipper front closure raincoat, fully stripes Lined and The Raincoat has 2 side pockets are a good size to hold all kinds of things, it covers the hips, and the hood is generous but doesn't overdo it.Attached Cotton Lined Hood with Adjustable Drawstrings give it a real styled look.",
      "categoryName": "women clothing",
      "categoryIndex": 4
    }
  ]
}
```

### Register new user

`POST http://127.0.0.1:8444/api/v1/access/register`

Before a user can add / remove products from their cart, they have to be registered, authenticated and authorized.
Request body parameters: {userFullname, userEmail, userPassword}

#### Request example:
```
curl --request POST \
  --url http://127.0.0.1:8444/api/v1/access/register \
  --header 'content-type: application/json' \
  --data '{
  "userFullname": "Anja Thiart",
  "userEmail": "test@example.com",
	"userPass": "password1234"
}'
```

#### Response: `200 OK`

```json
{
  "success": true,
  "userIndex": 58
}
```

### Login user

`POST http://127.0.0.1:8444/api/v1/access/login`

#### Request example:
```
curl --request POST \
  --url http://127.0.0.1:8444/api/v1/access/login \
  --header 'content-type: application/json' \
  --data '{
  "userEmail": "test@example.com",
	"userPass": "password1234"
}'
```

#### Response: `200 OK`

```json
{
  "sessionIndex": 867,
  "accessToken": "%ACCESS_TOKEN%",
  "sessionExpires": 1609350502
}
```

### Add a product to cart

`POST http://127.0.0.1:8444/api/v1/cart/product/:productIndex/add`

If the quantity body parameter is left out, it defaults to 1. If the quantity field has an invalid value, the request will fail.

#### Request example
```
curl --request POST \
  --url 'http://127.0.0.1:8444/api/v1/cart/product/40/add' \
  --header 'authorization: Bearer %ACESS_TOKEN%' \
  --header 'content-type: application/json' \
  --data '{
	"quantity": 2
}'
```

#### Response: `200 OK`
If the request was successful, the response will include the itemIndex of the line item in the cart that is affected by the change.
```json
{
  "itemIndex": 33
}
```
### Remove a product from the cart

`POST http://127.0.0.1:8444/api/v1/cart/product/:productIndex/remove`

If the quantity body parameter is left out, it defaults to 1. If the quantity field has an invalid value, the request will fail.

#### Request example

```
curl --request POST \
  --url http://127.0.0.1:8444/api/v1/cart/product/43/remove \
  --header 'authorization: Bearer %ACCESS_TOKEN%' \
  --header 'content-type: application/json' \
  --data '{
	"quantity": 1
}'
```

#### Response: `200 OK`
If the request was successful, the response will include the itemIndex of the line item in the cart that is affected by the change.
```json
{
  "itemIndex": 56
}
```

### Delete line item from cart

`POST http://127.0.0.1:8444/api/v1/cart/item/:itemIndex/delete`

#### Request example
```
curl --request POST \
  --url http://127.0.0.1:8444/api/v1/cart/item/56/delete \
  --header 'authorization: Bearer %ACCESS_TOKEN' \
  --header 'content-type: application/json'
 ```

#### Response: `200 OK`
Returned body if request was successful:
```json
{
  "success": true
}
```

### View users cart

`GET http://127.0.0.1:8444/api/v1/cart/view`

#### Request example

```
curl --request GET \
  --url 'http://127.0.0.1:8444/api/v1/cart/view?quantity=10' \
  --header 'authorization: Bearer %ACCESS_TOKEN' \
  --header 'content-type: application/json'
```

#### Response: `200 OK`
Example of returned fields for a users cart
```json
{
  "userIndex": 58,
  "totalItemsCount": 5,
  "totalPrice": 251.9,
  "timsestamp": 1606831293,
  "data": [
    {
      "itemIndex": 55,
      "productTitle": "WD 2TB Elements Portable External Hard Drive - USB 3.0 ",
      "productIndex": 40,
      "productImageURL": "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
      "itemQuantity": 3,
      "currency": "USD",
      "unitPrice": 64,
      "itemTotalPrice": 192
    },
    {
      "itemIndex": 58,
      "productTitle": "Lock and Love Women's Removable Hooded Faux Leather Moto Biker Jacket",
      "productIndex": 47,
      "productImageURL": "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_.jpg",
      "itemQuantity": 2,
      "currency": "USD",
      "unitPrice": 29.95,
      "itemTotalPrice": 59.9
    }
  ]
}
```

### Batch edit items in the cart
`POST http://127.0.0.1:8444/api/v1/cart/edit`

#### Request example
```
curl --request POST \
  --url http://127.0.0.1:8444/api/v1/cart/edit \
  --header 'authorization: Bearer %ACCESS_TOKEN' \
  --header 'content-type: application/json' \
  --data '{
	"editItems": [
		{
			"itemIndex": 55,
			"quantity": 2
		},
		{
			"itemIndex": 58,
			"quantity": 20
		}
	]
}
	'
```
#### Response: `200 OK` or `207 Multi-Status`

In this example one of the items in the request batch could be processed and the resulting response body is:

```json
{
  "errors": [
    "Item 55 not found"
  ],
  "successMessages": [
    "Item 58's quantity successfully updated to 20"
  ]
}
```

