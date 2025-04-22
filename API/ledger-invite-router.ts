/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/04/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import express, { Request, Response } from 'express'
import { successResponse, failedResponse } from './common-response'
import DBLedgerInviteManager from '../DatabaseModule/db-ledger-invite-manager'
import { Types } from 'mongoose'

const ledgerInviteRouter = express.Router()
const dbLedgerInviteManager = new DBLedgerInviteManager()

export const LedgerInviteRouter = () => {
    ledgerInviteRouter.post('/create', async (req: Request, res: Response) => {
        let ledgerId = req.body.ledgerId as string
        let sendUserId = req.body.sendUserId as string
        let receiveUserId = req.body.receiveUserId as string
        let version = req.body.version as number

        try {
            const ledgerInvite = await dbLedgerInviteManager.createLedgerInvite({ ledgerId, sendUserId, receiveUserId, version, _id: new Types.ObjectId() })
            res.status(200).send(successResponse({ "ledgerInvite": ledgerInvite }))
        } catch (error: Error | any) {
            res.status(500).send(failedResponse(error.code))
        }
    })

    ledgerInviteRouter.get('/get', async (req: Request, res: Response) => {
        let ledgerId = req.query.ledgerId as string | undefined
        let receiveUserId = req.query.receiveUserId as string | undefined
        if (ledgerId == undefined && receiveUserId == undefined) {
            res.status(400).send(failedResponse('Without ledgerId or receiveUserId'))
        } else {
            try {
                const ledgerInvites = await dbLedgerInviteManager.getLedgerInvite(ledgerId, receiveUserId)
                res.status(200).send(successResponse({ "ledgerInvites": ledgerInvites }))
            } catch (error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    ledgerInviteRouter.delete('/delete', async (req: Request, res: Response) => {
        let ledgerInviteId = req.query.ledgerInviteId as string | undefined
        let accept = req.query.accept as boolean | undefined
        if (ledgerInviteId == undefined || accept == undefined) {
            res.status(400).send(failedResponse('Without ledgerInviteId'))
        } else {
            try {
                await dbLedgerInviteManager.deleteLedgerInvite(ledgerInviteId, accept)
                res.status(200).send(successResponse({ "message": "Ledger invite deleted successfully" }))
            } catch (error: Error | any) {
                res.status(500).send(failedResponse(error.code))
            }
        }
    })

    return ledgerInviteRouter
}