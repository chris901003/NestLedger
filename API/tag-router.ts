/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/03/08.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import { successResponse, failedResponse } from './common-response'
import DBTagManager from 'DatabaseModule/db-tag-manager'
import { Types } from 'mongoose'

const tagRouter = express.Router()
const dbTagManager = new DBTagManager()

export const TagRouter = () => {
    tagRouter.post('/create', async (req: Request, res: Response) => {
        const label = req.body.label as string | undefined
        const color = req.body.color as string | undefined
        const ledgerId = req.body.ledgerId as string | undefined
        const version = req.body.version as number | undefined

        if (label == undefined || color == undefined || ledgerId == undefined || version == undefined) {
            res.status(400).send(failedResponse('Without label or color or ledgerId or version'))
        } else {
            try {
                const tagId = await dbTagManager.createTag({ 
                    label, 
                    color, 
                    ledgerId, 
                    version, 
                    _id: new Types.ObjectId() 
                })
                res.status(200).send(successResponse({ "tagId": tagId }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    tagRouter.get('/get', async (req: Request, res: Response) => {
        const tagId = req.query.tagId as string | undefined
        if (tagId == undefined) {
            res.status(400).send(failedResponse('Without tagId'))
        } else {
            try {
                const tag = await dbTagManager.getTag(tagId)
                res.status(200).send(successResponse({ "Tag": tag }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    tagRouter.get('/get-by-ledger', async (req: Request, res: Response) => {
        const ledgerId = req.query.ledgerId as string | undefined
        if (ledgerId == undefined) {
            res.status(400).send(failedResponse('Without ledgerId'))
        } else {
            try {
                const tags = await dbTagManager.getTags(ledgerId)
                res.status(200).send(successResponse({ "Tags": tags }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    tagRouter.patch('/update', async (req: Request, res: Response) => {
        const tagId = req.body.tagId as string | undefined
        let updateInfo = req.body.tag as any | undefined
        if (tagId == undefined || updateInfo == undefined) {
            res.status(400).send(failedResponse('Without tagId or updateInfo'))
        } else {
            try {
                updateInfo = await dbTagManager.updateTag(tagId, updateInfo)
                res.status(200).send(successResponse({ "Tag": updateInfo }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    tagRouter.delete('/delete', async (req: Request, res: Response) => {
        const tagId = req.query.tagId as string | undefined
        if (tagId == undefined) {
            res.status(400).send(failedResponse('Without tagId'))
        } else {
            try {
                await dbTagManager.deleteTag(tagId)
                res.status(200).send(successResponse({ "tagId": tagId }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    tagRouter.delete('/delete-by-ledger', async (req: Request, res: Response) => {
        const ledgerId = req.query.ledgerId as string | undefined
        if (ledgerId == undefined) {
            res.status(400).send(failedResponse('Without ledgerId'))
        } else {
            try {
                await dbTagManager.deleteTags(ledgerId)
                res.status(200).send(successResponse({ "ledgerId": ledgerId }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    return tagRouter
}