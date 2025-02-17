/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import FBAuthManager from "FirebaseModule/fb-auth"
import express, { Request, Response, NextFunction } from 'express'

const whitelist: Array<string> = ['/']
const fbAuthManager = new FBAuthManager()

export const authVerify = (app: express.Express) => {
    app.use((req: Request, res: Response, next: NextFunction) => {
        const path = req.path
        if (whitelist.includes(path)) {
            next()
        } else {
            verifyToken(req, res, next)
        }
    })
}

async function verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
        res.status(403).send('Unauthorized')
        return
    }

    try {
        const result = await fbAuthManager.verifyTokenAndGetUid(token)
        if (!result.isSuccess) {
            res.status(403).send('Unauthorized')
            return
        }
        req.uid = result.uid
        next()
    } catch (error) {
        res.status(403).send('Unauthorized')
        return
    }
}