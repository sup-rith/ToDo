const Validator = require('validator');
const isEmpty = require('./isEmpty');

const validateRegisterInput = (data) => {
    let errors = {};

    //check email
    if(isEmpty(data.email)){
        errors.email = "Email field cannot be empty";
    } else if(!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid, please provide a valid email";
    }

    //check password
    if(isEmpty(data.password)){
        errors.password = "password field cannot be empty";
    } else if(!Validator.isLength(data.password, {min: 6, max: 25})) {
        errors.password = "Password must be between 6 and 25 characters long";
    }

    //check confirm password field
    if(isEmpty(data.confirmPassword)){
        errors.confirmPassword = "confirm password field cannot be empty";
    } else if(!Validator.equals(data.confirmPassword, data.password)) {
        errors.confirmPassword = "passwords do not match";
    };

    //check name
    if(isEmpty(data.name)){
        errors.name = "name field cannot be empty";
    } else if(!Validator.isLength(data.name, {min: 1, max: 30})) {
        errors.password = "Name must be between 1 and 30 characters long";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};

module.exports = validateRegisterInput;