# shopping-cart
An API for a simple shopping cart application to allow users to interact with their online shopping cart.
Developed with `node v12.19.0` and `mySQL 8.0.22`

## Dev
- Install all npm modules: `npm install` to install or node dependencies
- Run server: `npm run start` to start server in dev mode
- To run tests: `npm run test`

## API Endpoints:

### View store products

This endpoint allows the user to add the following query parameters:
- page: page number of results to return
- limit: maximum number of items per page
- priceFrom: filter for prices that are above priceFrom
- priceTo: filter for prices that are below priceTo
- category: categoryIndex to filter on
- search: a string that will be matched against product title, description, and category

Certain defaults and max / min values may apply but are taken care of by the api.

#### Request example:

```
curl --request GET \
  --url 'http://127.0.0.1:8444/api/v1/products?page=1&limit=2&priceFrom=10&priceTo=1000&search=&category=1'
 ```

#### Response: `200 OK`

```json
{
  "page": 1,
  "pageCount": 2,
  "limit": 2,
  "search": "",
  "data": [
    {
      "productIndex": 11,
      "productTitle": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
      "productPrice": "109.95 USD",
      "productDescription": "Your perfect pack for everyday use and walks in the forest. Stash your laptop (up to 15 inches) in the padded sleeve, your everyday",
      "categoryName": "men clothing",
      "categoryIndex": 1
    },
    {
      "productIndex": 12,
      "productTitle": "Mens Casual Premium Slim Fit T-Shirts ",
      "productPrice": "22.30 USD",
      "productDescription": "Slim-fitting style, contrast raglan long sleeve, three-button henley placket, light weight & soft fabric for breathable and comfortable wearing. And Solid stitched shirts with round neck made for durability and a great fit for casual fashion wear and diehard baseball fans. The Henley style round neckline includes a three-button placket.",
      "categoryName": "men clothing",
      "categoryIndex": 1
    }
  ]
}
```


### Register new user

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






