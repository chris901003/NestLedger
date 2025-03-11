/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/03/11.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import mongoose from './db-connect'
import { Schema, Document, InferSchemaType, Types } from 'mongoose'

// TransactionManager Error Types
enum TransactionManagerErrorTypes {
    CREATE_TRANSACTION_FAILED = 'Failed to create transaction',
    TRANSACTION_NOT_FOUND = 'Transaction not found',
    UPDATE_TRANSACTION_FAILED = 'Failed to update transaction',
}

class DBTransactionManagerError extends Error {
    code: string
    rawError: Error | undefined
    constructor(type: TransactionManagerErrorTypes, rawError?: Error) {
        super(type)
        this.name = 'DBTransactionManagerError'
        this.code = type
        this.message = type
        this.rawError = rawError
    }
}

// Define the data structure of the transaction

const TransactionSchema: Schema = new Schema({
    title: { type: String, required: true },
    note: { type: String, required: false },
    money: { type: Number, required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    userId: { type: String, required: true },
    tagId: { type: String, required: true },
    ledgerId: { type: String, required: true },
    version: { type: Number, default: 1 },
})

type ITransaction = InferSchemaType<typeof TransactionSchema> & { _id: Types.ObjectId }
type ITransactionDocument = ITransaction & Document

const TransactionModel = mongoose.model<ITransactionDocument>('Transaction', TransactionSchema)

// Define the class to manage the transaction in the database

class DBTransactionManager {
    constructor() { }

    async createTransaction(data: ITransaction): Promise<ITransaction> {
        const transactionModel = new TransactionModel(data)
        try {
            const saveTransaction = await transactionModel.save()
            return saveTransaction
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.CREATE_TRANSACTION_FAILED, error)
        }
    }

    async getTransaction(transactionId: string): Promise<ITransaction> {
        let transaction: ITransaction | null = null
        try {
            transaction = await TransactionModel.findOne({ _id: transactionId }).lean()
            if (transaction == null) {
                throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND)
            }
            return transaction
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND, error)
        }
    }

    async getTransactionByLedger(
        ledgerId: string, 
        search: string | undefined, 
        startDate: Date | undefined, 
        endDate: Date | undefined,
        page: number = 0, 
        limit: number = 100
    ): Promise<ITransaction[]> {
        let transactions: ITransaction[] = []
        try {
            let query: any = { ledgerId }
            if (search) {
                query.title = { $regex: search, $options: 'i' }
            }
            let dateFilter: any = {}
            if (startDate) dateFilter.$gte = startDate
            if (endDate) dateFilter.$lte = endDate
            if (Object.keys(dateFilter).length > 0) query.date = dateFilter
            
            if (page <= 0) {
                transactions = await TransactionModel.find(query).lean()
            } else {
                transactions = await TransactionModel.find(query)
                    .sort({ _id: 1 })
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean()
            }
            return transactions
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND, error)
        }
    }
}

interface DBTransactionManager {
    TransactionModel: typeof TransactionModel
}

DBTransactionManager.prototype.TransactionModel = TransactionModel

export default DBTransactionManager
