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
import DBLedgerManager from '../DatabaseModule/db-ledger-manager'

const ledgerRouter = express.Router()
const dbLedgerManager = new DBLedgerManager()

export const LedgerRouter = () => {
    ledgerRouter.post('/create', async (req: Request, res: Response) => {
        let title = req.body.title
        let userId = req.uid as string
        let version = req.body.version
        try {
            const ledgerId = await dbLedgerManager.createLedger(title, userId, version)
            res.status(200).send(successResponse({ "title": title, "ledgerId": ledgerId }))
        } catch(error: Error | any) {
            res.status(500).send(failedResponse(error.code))
        }
    })

    ledgerRouter.get('/get', async (req: Request, res: Response) => {
        let ledgerId = req.query.ledgerId as string | undefined
        if (ledgerId == undefined) {
            res.status(400).send(failedResponse('Without ledgerId'))
        } else {
            try {
                const ledger = await dbLedgerManager.getLedger(ledgerId)
                res.status(200).send(successResponse({ "Ledger": ledger }))
            } catch(error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    return ledgerRouter
}