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
});

