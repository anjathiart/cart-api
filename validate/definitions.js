/* eslint-disable */
const Joi = require('joi');


module.exports = Joi.object({
	userIndex: Joi.number().integer().min(0).error(errors => {
		if (errors.length > 0) {
			error = new Error;
			error.msg = 'userIndex must be a positive integer';
			throw error;
		}
	}),
	userFullname: Joi.string().trim().min(3).max(64).error(errors => {
		if (errors.length > 0) {
			error = new Error;
			error.msg = 'userFullname must be a string of at least 3 characters';
			throw error;
		}
	}),
	userEmail: Joi.string().trim().lowercase().email({ minDomainSegments: 2 }).error(errors => {
		if (errors.length > 0) {
			error = new Error;
			error.msg = 'userEmail must be a valid email';
			throw error;
		}
	}),
	userPass: Joi.string().trim().min(8).max(128).error(errors => {
		if (errors.length > 0) {
			error = new Error;
			error.msg = 'userPass must be a at least 8 characters';
			throw error;
		}
	}),
	sessionIndex: Joi.number().integer().min(0).optional().error(errors => {
		if (errors.length > 0) {
			error = new Error;
			error.msg = 'sessionIndex must be a positive integer';
			throw error;
		}
	}),
	page: Joi.number().integer().min(1).optional().error(errors => {
		error = new Error;
		error.msg = 'page must be at least one character';
		throw error;
	}),
	limit: Joi.number().integer().min(1).max(1000).optional().error(errors => {
		error = new Error;
		error.msg = 'limit must be an integer between 1 and 1000';
		throw error;
	}),
	search: Joi.string().trim().allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'search string is invalid';
		throw error;
	}),
	order: Joi.string().trim().allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'order string is invalid';
		throw error;
	}),
	category: Joi.number().integer().min(0).allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'category must be a positive integer';
		throw error;
	}),
	priceFrom: Joi.number().min(0).allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'priceFrom must be a positive number';
		throw error;
	}),
	priceTo: Joi.number().min(1).allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'priceTo be a number greater than 1';
		throw error;
	}),
	inStock: Joi.boolean().allow('').optional().error(errors => {
		error = new Error;
		error.msg = 'inStock must either a valid boolean (true / false)';
		throw error;
	}),


});

