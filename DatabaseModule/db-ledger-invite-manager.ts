/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/04/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import mongoose from './db-connect'
import { Schema, Document, InferSchemaType, Types } from 'mongoose'
import DBLedgerManager from './db-ledger-manager'

// LedgerInviteManager Error Types
enum LedgerInviteManagerErrorTypes {
    CREATE_LEDGER_INVITE_FAILED = 'Failed to create ledger invite',
    INVALID_GET_LEDGER_INVITE = 'Invalid get ledger invite',
    FAILED_TO_GET_LEDGER_INVITE = 'Failed to get ledger invite',
    FAILED_TO_DELETE_LEDGER_INVITE = 'Failed to delete ledger invite',
}

class DBLedgerInviteManagerError extends Error {
    code: string
    rawError: Error | undefined
    constructor(type: LedgerInviteManagerErrorTypes, rawError?: Error) {
        super(type)
        this.name = 'DBLedgerInviteManagerError'
        this.code = type
        this.message = type
        this.rawError = rawError
    }
}

const LedgerInviteSchema: Schema = new Schema({
    ledgerId: { type: String, required: true },
    sendUserId: { type: String, required: true },
    receiveUserId: { type: String, required: true },
    version: { type: Number, default: 1 },
})

type ILedgerInvite = InferSchemaType<typeof LedgerInviteSchema> & { _id: Types.ObjectId }
type ILedgerInviteDocument = ILedgerInvite & Document

const LedgerInviteModel = mongoose.model<ILedgerInviteDocument>('LedgerInvite', LedgerInviteSchema)

// Define the class to manage the ledger invite in the database

class DBLedgerInviteManager {
    constructor(private dbLedgerManager: DBLedgerManager = new DBLedgerManager()) {}

    async createLedgerInvite(data: ILedgerInvite): Promise<ILedgerInvite> {
        const ledgerInviteModel = new LedgerInviteModel(data)
        try {
            const ledgerInvite = await ledgerInviteModel.save()
            return ledgerInvite
        } catch (error: any) {
            throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.CREATE_LEDGER_INVITE_FAILED, error)
        }
    }

    async getLedgerInvite(ledgerId: string | undefined, userId: string | undefined): Promise<ILedgerInvite[]> {
        if (ledgerId === undefined && userId === undefined) {
            throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.INVALID_GET_LEDGER_INVITE)
        }
        try {
            let query: any = {}
            if (ledgerId) {
                query['ledgerId'] = ledgerId
            }
            if (userId) {
                query['receiveUserId'] = userId
            }
            const ledgerInvites = await LedgerInviteModel.find(query)
            return ledgerInvites
        } catch (error: any) {
            throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.FAILED_TO_GET_LEDGER_INVITE, error)
        }
    }

    async deleteLedgerInvite(inviteId: string, accept: boolean): Promise<void> {
        try {
            const ledgerInvite = await LedgerInviteModel.findById(inviteId)
            if (!ledgerInvite) {
                throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.INVALID_GET_LEDGER_INVITE)
            }
            if (accept) {
                const ledgerId = ledgerInvite.ledgerId as string
                let ledgerData = await this.dbLedgerManager.getLedger(ledgerId)
                if (!ledgerData) {
                    throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.INVALID_GET_LEDGER_INVITE)
                }
                let userIds = ledgerData.userIds as string[]
                if (!userIds.includes(ledgerInvite.receiveUserId as string)) {
                    userIds.push(ledgerInvite.receiveUserId as string)
                }
                ledgerData.userIds = userIds
                await this.dbLedgerManager.updateLedger(ledgerId, ledgerData)
            }
            await LedgerInviteModel.findByIdAndDelete(inviteId)
        } catch {
            throw new DBLedgerInviteManagerError(LedgerInviteManagerErrorTypes.FAILED_TO_DELETE_LEDGER_INVITE)
        }
    }
}

interface DBLedgerInviteManager {
    LedgerInviteModel: typeof LedgerInviteModel
}

DBLedgerInviteManager.prototype.LedgerInviteModel = LedgerInviteModel
export default DBLedgerInviteManager