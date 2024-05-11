import { exec } from "child_process";
import Application from "../Application";

export class ConsoleManager {
    app: Application
    constructor(app: Application) {
        this.app = app
    }

    public execCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(`Error: ${error}`)
                    return
                }
                if (stderr) {
                    reject(`Error: ${stderr}`)
                }
                resolve(stdout)
            })
        })
    }
}