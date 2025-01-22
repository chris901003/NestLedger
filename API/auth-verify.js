/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import { FBAuthManager } from "../FirebaseModule/fb-auth.js"

const whiteList = []

export const authVerify = (app) => {
    app.use((req, res, next) => {
        const path = req.path
        if (whiteList.includes(path)) {
            next()
            return
        }
        verifyToken(req, res, next)
    })
}

async function verifyToken(req, res, next) {
    const token = req.headers.authorization.replace('Bearer ', '')
    if (!token) {
        res.status(401).send('Unauthorized')
        return
    }

    const fbAuthManager = new FBAuthManager()
    const result = await fbAuthManager.verifyTokenAndGetUID(token)
    if (!result.isSuccess) {
        res.status(401).send(result.errorType)
        return
    }

    req.uid = result.uid
    next()
}