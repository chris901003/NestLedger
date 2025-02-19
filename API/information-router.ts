/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/19.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import { successResponse, failedResponse } from './common-response'

const informationRouter = express.Router()

export const InformationRouter = () => {
    informationRouter.get('/basic', async (req: Request, res: Response) => {
        const basicInfo = {
            "author": "Zephyr-Huang",
            "contactUs": "service@xxooooxx.org",
            "copyright": "Copyright © 2025 Zephyr-Huang"
        }
        res.send(successResponse(basicInfo))
    })
    
    return informationRouter
}