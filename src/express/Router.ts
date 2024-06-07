import { Router, Request, Response } from 'express'
import jwt from "jsonwebtoken";
import { body, validationResult } from 'express-validator'

import { Server } from './Server';

export class expressRouter {
    private server: Server

    constructor(server: Server) {
        this.server = server;
    }

    createRoutes() {
        const routes = Router()

        //GET
        routes.get('/helloworld', (req: Request, res: Response) => {
    
            res.json({message: "halo"})
            res.status(200)
        })
        routes.get('/updateToken', this.updateToken.bind(this))
        routes.get('/hamster', this.getHamsterFacts.bind(this))
        routes.get('/gustavoGifs', this.getServerGifs.bind(this))
        routes.get('/reactionChances', this.getReactionChances.bind(this))
        routes.get('/users', this.getUsers.bind(this))
    
        //POST
        routes.post('/command',[
            body('command').isString().notEmpty()
        ] , this.execCommand.bind(this))
        routes.post('/signup', [
            body('email').isEmail().withMessage('Email is invalid.'),
            body('password').isLength({ min: 6, max: 64}).withMessage('Password must be at least 6 characters long.'),
            body('username').isString().withMessage('Username is invalid.')
        ] , this.signUp.bind(this))
        routes.post('/login', [
            body('email').isEmail().withMessage('Email is invalid.'),
            body('password').isString().notEmpty()
        ], this.signIn.bind(this))
        routes.post('/hamster',[
            body('title').isString().notEmpty(),
            body('description').isString().notEmpty()
        ] , this.addHamsterFact.bind(this))
        routes.post('/addReactionGif',[
            body('user').isString().notEmpty(),
            body('url').isString().notEmpty()
        ] , this.addReactionGif.bind(this))
        routes.post('/reactionChance',[
            body('gifChance').notEmpty(),
            body('type').isString().notEmpty()
        ] , this.setReactionChances.bind(this))
    
        //PUT
    
        //DELETE
        routes.delete('/deleteGif', [
            body('GifToDelete').isString().notEmpty(),
            body('user').isString().notEmpty()
        ], this.deleteGif.bind(this))


        return routes
    }

    private async deleteGif(req: Request, res: Response) {
        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/gif-reaction`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                },
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            console.log(e)
            res.send({ success: false, message: 'Internal server error.' })
        }
    }

    private async getUsers(req: Request, res: Response) {
        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                },
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            console.log(e)
            res.send({ success: false, message: 'Internal server error.' })
        }
    }

    private async setReactionChances(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: errors.array() });
            return
        }

        const { gifChance, type } = req.body

        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/reaction-chance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                },
                body: JSON.stringify({ gifChance, type })
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            console.log(e)
            res.send({ success: false, message: 'Internal server error.' })
        }
    }

    private async getReactionChances(req: Request, res: Response) {
        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/reaction-chance`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                }
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            console.log(e)
            res.send({ success: false, message: 'Internal server error.' })
        }
    }

    private async execCommand(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).send({ success: false, message: errors.array() });
            return
        }
        const { command } = req.body
        this.server.app.console.execCommand(command)
        .then((execRes) => {
            res.status(200)
            res.send({ success: true, message: 'Command executed successfully!', commandResponse: execRes })
        })
        .catch((err) => {
            res.status(422)
            res.send({ success: false, message: 'Invalid command'})
        })
    }

    private async addReactionGif(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: errors.array() });
            return
        }

        const { user, url } = req.body
        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/gif-reaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                },
                body: JSON.stringify({ user, url })
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            console.log(e)
            res.send({ success: false, message: 'Internal server error.' })
        }
    }

    private async getServerGifs(req: Request, res: Response) {
        try {
            const gustavoRes = await fetch(`http://${this.server.gustavoIP}/gif-reaction`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `bearer ${this.server.gustavoSecret}`
                }
            })
            const response = await gustavoRes.json()
            res.status(200)
            res.send(response)
        } catch(e) {
            res.status(500)
            res.send({ success: false, message: 'Internal server error.'})
        }
        
    }

    private signUp(req: Request, res: Response): void {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: errors.array() });
            return
        }

        const { email, username, password } = req.body

        this.server.app.database.createNewUser(username.trim(), email.trim(), password.trim()).then((user) => {
            res.status(201)
            res.send({ success: true, message: 'User created successfully!' })
        }).catch((error) => {
            res.status(409)
            if (error.code === 11000) {
                res.send({ success: false, message: 'User with this email already exists!' })
                return
            }
            console.log(error.message)
            res.send({ success: false, message: 'Error crating user!' })
        })
    }

    private async signIn(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: errors.array() });
            return
        }

        this.server.app.database.confirmPassword(req.body.email.trim(), req.body.password.trim())
        .then((response) => {
            if (!response) {
                res.status(401)
                return res.send({ success: false, message: 'Username or password is not correct.'})
            }

            this.server.app.database.getUserByEmail(req.body.email)
            .then(async (userData) => {
                if (!userData) return

                const { username, email, verified, accessLevel } = await userData
                const token = jwt.sign({ username, email, verified, accessLevel }, this.server.app.config.properties.jwt.secret, { expiresIn: '3d' })
                res.status(200)
                res.send({ success: true, message: { token }})
            }).catch((error) => {
                res.status(500)
                res.send({ success: false, message: 'Internal server error.' })
            })
        })
        .catch((error) => {
            res.status(500)
            res.send({ success: false, message: 'Internal server error.' })
        })
    }

    private async updateToken(req: Request, res: Response): Promise<void> {
        const authToken = req.headers.authorization
        if (!authToken) return

        const token = authToken.split(' ')[1]

        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            res.status(401)
            res.send({ success: false, message: 'Invalid token.' })
            return
        }

        if (this.isTokenExpiringSoon(token)) {
            delete decoded.exp
            const newToken = jwt.sign(decoded, this.server.app.config.properties.jwt.secret, { expiresIn: '7d' });
            res.send({ success: true, message: { token: newToken } });
            return 
        } else {
            res.status(200)
            res.send({ success: false, message: 'Only tokens with less than 1 day lifetime can be extended.'})
        }
    }

    async getHamsterFacts(req: Request, res: Response): Promise<void> {
        this.server.app.database.get5HamsterFacts().then((response) => {
            res.status(200)
            res.send({ success: true, message: response })
        }).catch((e) => {
            res.status(500)
            res.send({ success: false, message: [{title: 'Something went wrong, pls reload the page', description: 'Oops'}]})
        })
    }

    async addHamsterFact(req: Request, res: Response): Promise<void> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ success: false, message: errors.array() });
            return
        }

        const { title, description } = req.body
        this.server.app.database.createHamsterFact(title, description).then((response) => {
            res.status(201)
            res.send({ success: true, message: 'Fact created successfully!' })
        }).catch((e) => {
            res.status(500)
            res.send({ success: false, message: 'Failed to create a hamster fact.' })
        })
    }

    isTokenExpiringSoon(token: string): Boolean {
        try {
            const decoded: any = jwt.decode(token)

            if (!decoded || !decoded.exp) return false

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const oneDayInSeconds = 24 * 60 * 60;
            return (decoded.exp - currentTimestamp) < oneDayInSeconds;
        } catch (e) {
            return false
        }
    }
}
