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
import { authVerify } from './auth-verify'
import { UserRouter } from './user-router'
import { PhotoRouter } from './photo-router'
import { InformationRouter } from './information-router'
import { LedgerRouter } from './ledger-router'

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
        this.app.use(express.json())
        authVerify(this.app)

        this.app.use('/user', UserRouter())
        this.app.use('/photo', PhotoRouter())
        this.app.use('/information', InformationRouter())
        this.app.use('/ledger', LedgerRouter())
    }

    #createTestAPI() {
        this.app.get('/', (req:Request, res: Response) => {
            res.status(200).send('Welcome to NestLedger API')
        })
    }
}

export default APIManager
