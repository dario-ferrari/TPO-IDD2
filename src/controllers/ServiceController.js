'use strict'

const PruebaService = require('../services/PruebaService')

const pino = require('pino')
const transport = pino.transport({
    target: 'pino/file',
    options: { destination: 1, append: true }
})
const logger = pino(transport)

class ServiceController{

    constructor(){
        this.PruebaService=new PruebaService()
    }

    async info(req, res, next/**, group_id*/) {
        try {
            await this.PruebaService.init()
            logger.info(
                {
                    message: "CONTROLLER ::: INFO ::: BEGIN",
                    values: {"user_id": req.query.user_id, "region": req.query.region}
                }
            )
            const { data, redisInfo } = await this.PruebaService.getByUserId(req);
            const result = {
                data: data,
                redisInfo: redisInfo
            };
            logger.info({message: "CONTROLLER ::: INFO ::: END", values: {success: result}})
            
            if (redisInfo === true) {
                res.setHeader('X-Redis', 'true');
            }
            res.json(result.data);

        } catch (exception) {
            logger.error({message: "CONTROLLER ::: INFO ::: END", values: {error: exception}})
            next(exception)
        }
    }

    async new(req, res, next/**, group_id*/) {
        try{
            await this.PruebaService.init()
            logger.info({message: "CONTROLLER ::: NEW ::: BEGIN", values: { body: req.body, query: req.query }})
            let result = await this.PruebaService.setOne(req)
            res.status(201)
            res.json(result.data)
            logger.info({message: "CONTROLLER ::: NEW ::: END", values: {success: "SUCCESS"}})
        } catch (exception) {
            logger.error({message: "CONTROLLER ::: NEW ::: END", values: {error: exception}})
            next(exception)
        }
    }

    async del(req, res, next/**, group_id*/) {
        try {
            await this.PruebaService.init()
            logger.info({message: "CONTROLLER ::: DEL ::: BEGIN", values: { body: req.body, query: req.query }})
            let result = await this.PruebaService.delOne(req)
            res.json(result.data)
            logger.info({message: "CONTROLLER ::: DEL ::: END", values: {success: "SUCCESS"}})
        } catch (exception) {
            logger.error({message: "CONTROLLER ::: DEL ::: END", values: {error: exception}})
            next(exception)
        }
    }

}

module.exports=ServiceController