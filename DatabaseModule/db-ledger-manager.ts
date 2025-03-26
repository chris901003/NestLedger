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
import { Schema, Document, InferSchemaType, Types } from 'mongoose'

// LedgerManager Error Types
enum LedgerManagerErrorTypes {
    CREATE_LEDGER_FAILED = 'Failed to create ledger',
    LEDGER_NOT_FOUND = 'Ledger not found',
    LEDGER_UPDATE_FAILED = 'Failed to update ledger',
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
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
})

type ILedger = InferSchemaType<typeof LedgerSchema> & { _id: Types.ObjectId }
type ILedgerDocument = ILedger & Document

const LedgerModel = mongoose.model<ILedgerDocument>('Ledger', LedgerSchema)

// Define the class to manage the ledger in the database

class DBLedgerManager {
    constructor() { }

    async createLedger(title: string, userId: string, version: number): Promise<ILedger> {
        const ledgerModel = new this.LedgerModel({
            title: title,
            userIds: [userId],
            version: version,
        })
        try {
            const saveLedger = await ledgerModel.save()
            return saveLedger
        } catch (error: Error | any) {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.CREATE_LEDGER_FAILED, error)
        }
    }

    async getLedger(ledgerId: string): Promise<ILedger> {
        try {
            const ledger = await this.LedgerModel.findById(ledgerId).lean()
            if (!ledger) {
                throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_NOT_FOUND)
            }
            return ledger
        } catch (error: Error | any) {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_NOT_FOUND, error)
        }
    }

    async updateLedger(ledgerId: string, updateInfo: ILedger): Promise<ILedger> {
        try {
            const updateLedger = await this.LedgerModel.findByIdAndUpdate(
                ledgerId,
                updateInfo,
                {
                    new: true,
                    runValidators: true
                }
            ).lean()
            if (!updateLedger) {
                throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_NOT_FOUND)
            }
            return updateLedger
        } catch {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_UPDATE_FAILED)
        }
    }

    async incrementTotalIncome(ledgerId: string, money: number) {
        try {
            await this.LedgerModel.findByIdAndUpdate(
                ledgerId,
                { $inc: { totalIncome: money } }
            )
        } catch {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_UPDATE_FAILED)
        }
    }

    async incrementTotalExpense(ledgerId: string, money: number) {
        try {
            await this.LedgerModel.findByIdAndUpdate(
                ledgerId,
                { $inc: { totalExpense: money } }
            )
        } catch {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_UPDATE_FAILED)
        }
    }

    async deleteLedger(ledgerId: string) {
        try {
            await this.LedgerModel.findByIdAndDelete(ledgerId)
        } catch {
            throw new DBLedgerManagerError(LedgerManagerErrorTypes.LEDGER_NOT_FOUND)
        }
    }
}

interface DBLedgerManager {
    LedgerModel: typeof LedgerModel
}

DBLedgerManager.prototype.LedgerModel = LedgerModel

export default DBLedgerManager