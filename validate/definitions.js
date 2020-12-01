/* eslint-disable */
const Joi = require('joi');

const joiError = (msg) => {
	error = new Error;
	error.msg = msg;
	throw error;
}

module.exports = Joi.object({
	userIndex: Joi.number().integer().min(0).error(errors => {
		joiError('userIndex must be a positive integer')
	}),
	userFullname: Joi.string().trim().min(3).max(64).error(errors => {
		joiError('userFullname must be a string of at least 3 characters')
	}),
	userEmail: Joi.string().trim().lowercase().email({ minDomainSegments: 2 }).error(errors => {
		joiError('userEmail must be a valid email')
	}),
	userPass: Joi.string().trim().min(8).max(128).error(errors => {
		joiError('userPass must be a at least 8 characters')
	}),
	sessionIndex: Joi.number().integer().min(0).optional().error(errors => {
		joiError('sessionIndex must be a positive integer')
	}),
	page: Joi.number().integer().min(1).optional().error(errors => {
		joiError('page must be an integer of at least 1')
	}),
	limit: Joi.number().integer().min(1).max(1000).optional().error(errors => {
		joiError('limit must be an integer between 1 and 1000')
	}),
	search: Joi.string().trim().allow('').optional().error(errors => {
		joiError('search string is invalid')
	}),
	order: Joi.string().trim().allow('').optional().error(errors => {
		joiError('order string is invalid')
	}),
	category: Joi.number().integer().min(0).allow('').optional().error(errors => {
		joiError('category must be a positive integer')
	}),
	priceFrom: Joi.number().min(0).allow('').optional().error(errors => {
		joiError('priceFrom must be a positive number')
	}),
	priceTo: Joi.number().min(1).allow('').optional().error(errors => {
		joiError('priceTo be a number greater than 1')
	}),
	inStock: Joi.boolean().allow('').optional().error(errors => {
		joiError('inStock must either a valid boolean (true / false)')
	}),
	quantity: Joi.number().integer().min(1).allow('').optional().error(errors => {
		joiError('quantity must be a integer at least equal to 1')
	}),
	categoryIndex: Joi.number().integer().min(1).allow('').optional().error(errors => {
		joiError('category must be a integer at least equal to 1')
	}),
	productIndex: Joi.number().integer().min(1).error(errors => {
		joiError('productIndex must be a integer at least equal to 1')
	}),
	itemIndex: Joi.number().integer().min(1).error(errors => {
		joiError('itemIndex must be a integer at least equal to 1')
	}),
	editItems: Joi.array().min(1).items(Joi.object({
		itemIndex: Joi.number().integer().min(1).required().error(errors => {
			joiError('itemIndex must be a integer at least equal to 1')
		}),
		quantity: Joi.number().integer().min(1).required().error(errors => {
			joiError('quantity must be a integer at least equal to 1')
		}),
	})).error(errors => {
		joiError('editItems must be an array of objects with at least 1 object')
	}),
});

