/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/18.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import multer from 'multer'
import * as pth from 'path'
import dotenv from 'dotenv'
import { successResponse, failedResponse } from './common-response'
import FileManager from '../FileModule/file-manager'

const photoRouter = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

dotenv.config()
const fileRootPath = process.env.FILE_ROOT_PATH as string

export const PhotoRouter = () => {
    /*
    - 受保護的 API
        - API List:
            - [Post] /photo/single
            - [Post] /photo/multiple
            - [Get] /photo/single/:path
        - 方法:
            - 會在 path 最前面加上使用者的 uid
                - Ex: /avatar/avatar.jpg -> /:uid/avatar/avatar.jpg
        
    */
    photoRouter.post('/single', upload.single('photo'), async (req: Request, res: Response) => {
        /*
        API: /photo/single
        Method: POST
        Description: Save a single photo to the server
        Type: multipart/form-data
        Form-Data: {
            path: string,
            name: string (need to include file extension),
            photo: file
        }
        */
        const path = req.body.path
        let name = req.body.name
        let buffer = req.file?.buffer

        if (path == undefined) {
            res.status(400).send(failedResponse('Without path'))
            return
        } else if (name == undefined) {
            res.status(400).send(failedResponse('Without name'))
            return
        } else if (buffer == undefined) {
            res.status(400).send(failedResponse('Without photo'))
            return
        }
        const userFileRootPath = pth.join(fileRootPath, req.uid as string)
        const fullPath = pth.join(userFileRootPath, path as string)
        name = name as string
        buffer = buffer as Buffer

        await FileManager.createFolderIfNeeded(fullPath)
        await FileManager.savePhoto(fullPath, name, buffer)

        res.send(successResponse({ path, name, size: buffer.length }))
    })

    photoRouter.post('/multiple', upload.array('photos'), async (req: Request, res: Response) => {
        /*
        API: /photo/multiple
        Method: POST
        Description: Save multiple photos to the server
        Type: multipart/form-data
        Form-Data: {
            path: string,
            names: string (comma separated),
            photos: files (multiple)
        }
        */
        const path = req.body.path
        const name = req.body.names
        let files = req.files

        if (path == undefined) {
            res.status(400).send(failedResponse('Without path'))
            return
        } else if (name == undefined) {
            res.status(400).send(failedResponse('Without names'))
            return
        } else if (files == undefined) {
            res.status(400).send(failedResponse('Without photos'))
            return
        }
        files = files as Express.Multer.File[]

        const names = name.split(',') as string[]
        if (names.length != files.length) {
            res.status(400).send(failedResponse('Names and files are not matched'))
            return
        }

        let totalSize = 0
        files.forEach(async (file, index) => {
            const userFileRootPath = pth.join(fileRootPath, req.uid as string)
            const fullPath = pth.join(userFileRootPath, path as string)
            await FileManager.createFolderIfNeeded(fullPath)
            await FileManager.savePhoto(fullPath, names[index], file.buffer)
            totalSize += file.size
        })

        res.send(successResponse({ path, names, totalSize }))
    })

    photoRouter.get('/single/:path(*)', async (req: Request, res: Response) => {
        /*
        API: /photo/single/:path
            Ex: /photo/single/avatar/avatar.jpg
        Method: GET
        Description: Get a single photo from the server
        Response: Buffer
        */
        const uid = req.uid as string
        const path = req.params.path

        if (path == undefined) {
            res.status(400).send(failedResponse('Without path'))
            return
        }
        const userFileRootPath = pth.join(fileRootPath, uid)
        const fullPath = pth.join(userFileRootPath, path)
        try {
            const buffer = await FileManager.readPhoto(fullPath)
            res.send(buffer)
        } catch(error: Error | any) {
            res.status(500).send(failedResponse(error.message))
        }
    })

    photoRouter.delete('/single/:path(*)', async (req: Request, res: Response) => {
        /*
        API: /photo/single/:path
            Ex: /photo/single/avatar/avatar.jpg
        Method: DELETE
        Description: Delete a single photo from the server
        */
        const uid = req.uid as string
        const path = req.params.path

        if (path == undefined) {
            res.status(400).send(failedResponse('Without path'))
            return
        }

        const userFileRootPath = pth.join(fileRootPath, uid)
        const fullPath = pth.join(userFileRootPath, path)
        try {
            await FileManager.deletePhoto(fullPath)
            res.send(successResponse(''))
        } catch(error: Error | any) {
            res.status(500).send(failedResponse(error.message))
        }
    })

    return photoRouter
}