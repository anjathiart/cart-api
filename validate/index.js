const Joi = require('joi');

// load definition modules -> can split out as needed later
const definitions = require('./definitions');

module.exports = (schema, inputs) => {
	const result = {
		missingSchema: false,
		errors: [],
		validInput: {},
	};

	let inputsToBeValidated = {};
	// check inputs agains schema
	Object.keys(schema).forEach(key => {
		if (inputs[key]) {
			inputsToBeValidated = { ...inputsToBeValidated, [key]: inputs[key] };
		} else if (schema[key].required && schema[key].required === true) {
			result.errors.push(`${key} is missing`);
		}
	});

	let validationResult = {};
	// validate inputs agains joi-schemma definitions
	try{
		validationResult = definitions.validate(inputsToBeValidated).value;
	} catch (error) {
		result.errors.push(error.msg);
	}

	result.validInput = { ...validationResult };
	return result;
};
