/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/03/08.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import mongoose from './db-connect'
import { Schema, Document, InferSchemaType } from 'mongoose'

// LedgerManager Error Types
enum LedgerManagerErrorTypes {
    CREATE_LEDGER_FAILED = 'Failed to create ledger'
}

class DBLedgerManagerError extends Error {
    code: string
    rawError: Error | undefined
    constructor(type: LedgerManagerErrorTypes, rawError?: Error) {
        super(type)
        this.name = 'DBLedgerManagerError'
        this.code = type
        this.message = type
        this.rawError = rawError
    }
}

// Define the data structure of the ledger

const LedgerSchema: Schema = new Schema({
    title: { type: String, required: true },
    userIds: { type: [String], required: true },
    tagIds: { type: [String], default: [] },
    version: { type: Number, default: 1 },
})

type ILedger = InferSchemaType<typeof LedgerSchema>
type ILedgerDocument = ILedger & Document

const LedgerModel = mongoose.model<ILedgerDocument>('Ledger', LedgerSchema)

// Define the class to manage the ledger in the database

class DBLedgerManager {
    constructor() { }

    async createLedger(title: string, userId: string, version: number) {
        const ledgerModel = new this.LedgerModel({
            title: title,
            userIds: [userId],
            tagIds: [],
            version: version,
        })
        try {
            await ledgerModel.save()
        } catch (error: Error | any) {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.CREATE_LEDGER_FAILED, error)
        }
    }
}

interface DBLedgerManager {
    LedgerModel: typeof LedgerModel
}

DBLedgerManager.prototype.LedgerModel = LedgerModel

export default DBLedgerManager