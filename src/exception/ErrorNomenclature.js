'use strict'

/**REVISAR NOMENCLATURA DE ERRORES*/

const contenido= "ERROR_"

class ErrorNomenclature {
    
    /**10 mil en 10 mil por categoria de error reportado */

    static unknownError() {
        return `${contenido}000000`
    }

    static jsonBodyError() {
        return `${contenido}000001`
    }

    static authError() {
        return `${contenido}300000`
    }

    static withOutAuthorizationHeader() {
        return `${contenido}300001`
    }

    static errorCassandra() {
        return `${contenido}100000`
    }

    static errorCassandraInsert() {
        return `${contenido}100002`
    }

    static errorCassandraUpdate() {
        return `${contenido}100003`
    }

    static errorCassandraSelect() {
        return `${contenido}100004`
    }

    static errorCassandraTimeOut() {
        return `${contenido}100005`
    }

    static errorRedis() {
        return `${contenido}200000`
    }

    static badRequest() {
        return `${contenido}500000`
    }

    static emptyBody(){
        return `${contenido}400000`
    }

    static emptyOption(){
        return `${contenido}600001`
    }

    static nonExistingUser(){
        return `${contenido}600002`
    }

    static emptyGroupId(){
        return `${contenido}600003`
    }

    static emptyUserId(){
        return `${contenido}600004`
    }

    static emptyRegion(){
        return `${contenido}600005`
    }

}

module.exports = ErrorNomenclature