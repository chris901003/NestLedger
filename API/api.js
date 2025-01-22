/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express from 'express'
import { authVerify } from './auth-verify.js'
import { UserRouter } from './user-router.js'

class APIManager {
    constructor() {
        this.app = express()
        this.#generateAPI()
        this.#createTestAPI()
        this.#startServer()
    }

    #startServer() {
        this.app.listen(3000, () => {
            console.log('Server started')
        })
    }

    #generateAPI() {
        this.app.use(express.json())
        authVerify(this.app)

        this.app.use('/user', UserRouter())
    }

    #createTestAPI() {
        this.app.get('/', (req, res) => {
            res.send('Welcome to NestLedger API')
        })
    }
}

export { APIManager }

test()
async function test() {
    const apiManager = new APIManager()
}