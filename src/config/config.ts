import fs from 'fs'
import path from 'path'

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
        }
    }

    constructor() {
        if (fs.existsSync(path.resolve('config.json'))) {
            console.log('Config found!')
            const configFile = fs.readFileSync(path.resolve('config.json'), 'utf-8')
            this.properties = JSON.parse(configFile)

            this.properties.mongo.auth.password = process.env.MONGOPASSWORD || ''
            this.properties.mongo.auth.username = process.env.MONGOUSERNAME || ''
        } else {
            console.log('Config not found! Pls ensure that you have config.json in the project root folder.')

            process.exit(1)
        }
    }

    getMongoURL() {
        return this.properties.mongo.mongoURL.replace('<password>', this.properties.mongo.auth.password).replace('<username>', this.properties.mongo.auth.username)
    }
}