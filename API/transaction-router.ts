/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/03/11.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import { successResponse, failedResponse } from './common-response'
import DBTransactionManager from 'DatabaseModule/db-transaction-manager'
import { Types } from 'mongoose'

const transactionRouter = express.Router()
const dbTransactionManager = new DBTransactionManager()

export const TransactionRouter = () => {
    transactionRouter.post('/create', async (req: Request, res: Response) => {
        const title = req.body.title as string | undefined
        const note = req.body.note as string | undefined
        const money = req.body.money as number | undefined
        const date = req.body.date as Date | undefined
        const type = req.body.type as string | undefined
        const userId = req.uid as string
        const tagId = req.body.tagId as string | undefined
        const ledgerId = req.body.ledgerId as string | undefined
        const version = req.body.version as number | undefined

        if (title == undefined || money == undefined || date == undefined || type == undefined || tagId == undefined || ledgerId == undefined || version == undefined) {
            res.status(400).send(failedResponse('Without title or money or date or type or tagId or ledgerId or version'))
        } else {
            try {
                const transaction = await dbTransactionManager.createTransaction({
                    title, note, money, date, type, userId, tagId, ledgerId, version,
                    _id: new Types.ObjectId()
                })
                res.status(200).send(successResponse({ "transaction": transaction }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    transactionRouter.get('/get', async (req: Request, res: Response) => {
        const transactionId = req.query.transactionId as string | undefined
        if (transactionId == undefined) {
            res.status(400).send(failedResponse('Without transactionId'))
        } else {
            try {
                const transaction = await dbTransactionManager.getTransaction(transactionId)
                res.status(200).send(successResponse({ "transaction": transaction }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    transactionRouter.get('/get-by-ledger', async (req: Request, res: Response) => {
        const ledgerId = req.query.ledgerId as string | undefined
        let page = req.query.page as string | undefined | number
        let limit = req.query.limit as string | undefined | number
        const search = req.query.search as string | undefined
        const startDate = req.query.startDate as Date | undefined
        const endDate = req.query.endDate as Date | undefined
        
        if (typeof page === 'string') {
            page = parseInt(page)
        }
        if (typeof limit === 'string') {
            limit = parseInt(limit)
        }

        if (ledgerId == undefined) {
            res.status(400).send(failedResponse('Without ledgerId'))
        } else {
            try {
                const transactions = await dbTransactionManager.getTransactionByLedger(
                    ledgerId, 
                    search, 
                    startDate,
                    endDate,
                    page, 
                    limit
                )
                res.status(200).send(successResponse({ "transactions": transactions }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    return transactionRouter
}