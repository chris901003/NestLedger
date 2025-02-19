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
import { successResponse, failedResponse } from './common-response'
import DBUserInfoManager from '../DatabaseModule/db-user-manager'

const userRouter = express.Router()
const dbUserInfoManager = new DBUserInfoManager()

export const UserRouter = () => {
    userRouter.get('/login', async (req: Request, res: Response) => {
        let uid: string | undefined = req.uid
        if (uid == undefined) {
            res.status(401).send(failedResponse('Without user uid'))
        }
        
        try {
            await dbUserInfoManager.createUserInfoIfNeeded(uid as string)
            res.status(200).send(successResponse({ uid }))
        } catch(error: Error | any) {
            res.status(500).send(failedResponse(error.code))
        }
    })

    userRouter.get('/get', async (req: Request, res: Response) => {
        let uid = req.uid as string
        try {
            const userInfo = await dbUserInfoManager.getUserInfo(uid)
            res.status(200).send(successResponse({ "UserInfo": userInfo }))
        } catch(error: Error | any) {
            res.status(500).send(failedResponse(error.code))
        }
    })

    userRouter.patch('/update', async (req: Request, res: Response) => {
        let uid = req.uid as string
        let updateInfo = req.body
        const updateUserInfo = await dbUserInfoManager.UserInfoModel.findOneAndUpdate(
            {id: uid}, 
            updateInfo, 
            {
                new: true,
                runValidators: true
            }
        ).lean()
        res.status(200).send(successResponse({ "UserInfo": updateUserInfo }))
    })

    return userRouter
}
