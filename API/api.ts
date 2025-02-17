/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import { UserRouter } from './user-router'

class APIManager {
    app: express.Express
    constructor() { 
        this.app = express()
        this.#startServer()
        this.#generateAPI()
        this.#createTestAPI()
    }

    #startServer() {
        this.app.listen(3000, () => {
            console.log('Server is running on port 3000 (TypeScript)')
        })
    }

    #generateAPI() {
        this.app.use('/user', UserRouter())
    }

    #createTestAPI() {
        this.app.get('/', (req:Request, res: Response) => {
            res.status(200).send('Welcome to NestLedger API')
        })
    }
}

export default APIManager
