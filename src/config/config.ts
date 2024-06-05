import fs from 'fs'
import path from 'path'
import config from '../../config.json'

export class Config {
    properties = {
        "mongo": {
            "mongoURL": "testString",
            "databaseName": "",
            "auth": {
                "username": "",
                "password": ""
            }
        },
        "express": {
            "port": 3000
        },
        "jwt": {
            "secret": ""
        }
    }

    constructor() {
        if (config) {
            console.log('[config] Config file found!')
            this.properties = config

            this.properties.mongo.auth.password = process.env.MONGOPASSWORD || ''
            this.properties.mongo.auth.username = process.env.MONGOUSERNAME || ''
            this.properties.jwt.secret = process.env.JWTSECRET || ''
            this.properties.express.port = parseInt(process.env.PORT || '3000') || 3000
        } else {
            console.log('[config] Config file not found! Pls ensure that you have config.json in the project root folder.')

            process.exit(1)
        }
    }

    getMongoURL(): string {
        return this.properties.mongo.mongoURL.replace('<password>', this.properties.mongo.auth.password).replace('<username>', this.properties.mongo.auth.username)
    }
}