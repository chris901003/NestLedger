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

    userRouter.get('/get-user-by-email', async (req: Request, res: Response) => {
        let email = req.query.email as string | undefined

        if (email == undefined) {
            res.status(400).send(failedResponse('Without email'))
            return
        } else {
            try {
                const userInfo = await dbUserInfoManager.getUserInfoByEmail(email)
                res.status(200).send(successResponse({ "UserInfo": userInfo }))
            } catch {
                res.status(500).send(failedResponse('Failed to get user info'))
            }
        }
    })

    userRouter.get('/get-user-by-uid', async (req: Request, res: Response) => {
        let uid = req.query.uid as string | undefined

        if (uid == undefined) {
            res.status(400).send(failedResponse('Without uid'))
            return
        } else {
            try {
                const userInfo = await dbUserInfoManager.getUserInfo(uid)
                res.status(200).send(successResponse({ "UserInfo": userInfo }))
            } catch {
                res.status(500).send(failedResponse('Failed to get user info'))
            }
        }
    })

    userRouter.post('/get-multiple-user-info', async (req: Request, res: Response) => {
        let targetUids = req.body.uids as string[] | undefined

        if (targetUids == undefined) {
            res.status(400).send(failedResponse('Without targetUids'))
            return
        } else {
            try {
                const userInfos = await dbUserInfoManager.getMultipleUserInfo(targetUids)
                res.send(successResponse({ "userInfos": userInfos }))
            } catch {
                res.status(500).send(failedResponse('Failed to get user infos'))
            }
        }
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

    userRouter.delete('/delete', async (req: Request, res: Response) => {
        let uid = req.query.uid as string | undefined

        if (uid == undefined) {
            res.status(400).send(failedResponse('Without uid'))
            return
        } else {
            try {
                await dbUserInfoManager.deleteUserInfo(uid)
                res.status(200).send(successResponse({ "uid": uid }))
            } catch {
                res.status(500).send(failedResponse('Failed to delete user'))
            }
        }
    })

    return userRouter
}
