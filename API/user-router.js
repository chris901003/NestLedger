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
import { successResponse, failedResponse } from './common-response.js'
import { DBUserManager } from '../DatabaseModule/db-user-manager.js'

const userRouter = express.Router()
const dbUserManager = new DBUserManager()

export const UserRouter = () => {
    userRouter.get('/login', async (req, res) => {
        const uid = req.uid

        try {
            await dbUserManager.createUserInfoIfNeeded(uid)
            res.status(200).send(successResponse({ uid }))
        } catch (error) {
            res.status(500).send(failedResponse(error.code))
        }
    })

    return userRouter
}