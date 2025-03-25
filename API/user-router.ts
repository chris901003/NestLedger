/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import * as pth from 'path'
import express, { Request, Response } from 'express'
import { successResponse, failedResponse } from './common-response'
import DBUserInfoManager from '../DatabaseModule/db-user-manager'
import FileManager from 'FileModule/file-manager'

const userRouter = express.Router()
const dbUserInfoManager = new DBUserInfoManager()
const fileRootPath = process.env.FILE_ROOT_PATH as string

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

    userRouter.get('/get-avatar', async (req: Request, res: Response) => {
        let targetUid = req.query.uid as string | undefined

        if (targetUid == undefined) {
            res.status(400).send(failedResponse('Without targetUid'))
            return
        } else {
            try {
                const userInfo = await dbUserInfoManager.getUserInfo(targetUid)
                const avatarPath = userInfo.avatar as string
                const userFileRootPath = pth.join(fileRootPath, targetUid)
                const fullPath = pth.join(userFileRootPath, avatarPath)
                const avatar = await FileManager.readPhoto(fullPath)
                res.send(avatar)
            } catch {
                res.status(500).send(failedResponse('Failed to get avatar'))
            }
        }
    })

    return userRouter
}
