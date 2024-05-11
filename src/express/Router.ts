import { Router, Request, Response } from 'express'

export const routes = Router()

//GET
routes.get('/helloworld', (req: Request, res: Response) => {

    res.json({message: "halo"})
    res.status(200)
})

//POST


//PUT

//DELETE


