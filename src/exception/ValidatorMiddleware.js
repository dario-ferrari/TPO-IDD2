'use strict'

const ValidateException = require('./../exception/ValidateException')
const ErrorTransform = require("./../model/Error/ErrorTransform")
const ErrorNomenclature = require('./../exception/ErrorNomenclature')
const Debugging = require('../util/Debugging')

class ValidatorMiddleware {


    async add(req, res, next) {
        
        let errors = []
        const body = req.body;
        const params = req.params;

        if (isGroupIdValid(params)) {
            errors.push(errorResponder("Invalid group_id", ErrorNomenclature.emptyGroupId(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }

        if (isEmptyObject(body)) {
            errors.push(errorResponder("Body request without properties", ErrorNomenclature.emptyBody(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }

        if (isEmptyProperty(req.query.user_id)) {
            errors.push(errorResponder("User_id is empty", ErrorNomenclature.emptyUserId(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }
         
        if (isEmptyProperty(req.query.region)) {
            errors.push(errorResponder("Region is empty", ErrorNomenclature.emptyRegion(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }

        return next()

    }

    async del(req, res, next){
        
        let errors = []
        const params = req.params;
        
        if (isGroupIdValid(params)) {
            errors.push(errorResponder("Invalid group_id", ErrorNomenclature.emptyGroupId(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }

        if (isEmptyProperty(req.query.user_id)) {
            errors.push(errorResponder("User_id is empty", ErrorNomenclature.emptyUserId(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }
         
        if (isEmptyProperty(req.query.region)) {
            errors.push(errorResponder("Region is empty", ErrorNomenclature.emptyRegion(), __dirname + ":" + Debugging.getLine()))
            return next(new ValidateException(errors))
        }

        return next()
    }
}

function isGroupIdValid(params){
    let result = true;
    if (!isNaN(params.group_id) && (params.group_id>=1)) {
        result = false
    }
    return result;
}

function isEmptyProperty(property){
    let result = false
    if (!property){
        result = true
    }
    return result
}

function isEmptyObject(object) {
    return Object.keys(object).length === 0
}

function errorResponder(message, code, source) {
    return transform({
        message: message,
        code: code,
        source: source
    })
}

function transform(input) {
    let errorTransformer = new ErrorTransform()
    return errorTransformer.transform(input)
}

module.exports = ValidatorMiddleware