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
import DBLedgerManager from './db-ledger-manager'

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
    title: { type: String, required: false },
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
    constructor(private dbLedgerManager: DBLedgerManager=new DBLedgerManager()) { }

    async createTransaction(data: ITransaction): Promise<ITransaction> {
        const transactionModel = new TransactionModel(data)
        try {
            const session = await mongoose.startSession()
            const transaction = await session.withTransaction(async () => {
                const saveTransaction = await transactionModel.save()
                if (saveTransaction.type === 'income') {
                    await this.dbLedgerManager.incrementTotalIncome(data.ledgerId as string, data.money as number)
                } else {
                    await this.dbLedgerManager.incrementTotalExpense(data.ledgerId as string, data.money as number)
                }
                return saveTransaction
            })
            return transaction
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
        tagId: string | undefined,
        type: string | undefined,
        userId: string | undefined,
        sortedOrder: number = 1,
        page: number = 1, 
        limit: number = 100
    ): Promise<ITransaction[]> {
        let transactions: ITransaction[] = []
        try {
            let query: any = { ledgerId }
            if (search) { query.title = { $regex: search, $options: 'i' } }
            if (tagId) { query.tagId = tagId }
            if (type) { query.type = type }
            if (userId) { query.userId = userId }
            let dateFilter: any = {}
            if (startDate) dateFilter.$gte = startDate
            if (endDate) dateFilter.$lte = endDate
            if (Object.keys(dateFilter).length > 0) query.date = dateFilter
            
            transactions = await TransactionModel.find(query)
                .sort({ date: sortedOrder === 1 ? 1 : -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            return transactions
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND, error)
        }
    }

    async updateTransaction(transactionId: string, data: ITransaction): Promise<ITransaction> {
        try {
            const session = await mongoose.startSession()
            const transaction = await session.withTransaction(async () => {
                const oldTransaction = await TransactionModel.findOne({ _id: transactionId }).lean()
                if (oldTransaction == null) {
                    throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND)
                }
                const diff = (oldTransaction.money as number) - (data.money as number)
                const ledgerId = oldTransaction.ledgerId as string
                if (oldTransaction.type === 'income') {
                    await this.dbLedgerManager.incrementTotalIncome(ledgerId, -diff)
                } else {
                    await this.dbLedgerManager.incrementTotalExpense(ledgerId,  -diff)
                }
                const transaction = await TransactionModel
                .findOneAndUpdate({ _id: transactionId }, data, { new: true, runValidators: true })
                .lean()
                if (transaction == null) {
                    throw new DBTransactionManagerError(TransactionManagerErrorTypes.UPDATE_TRANSACTION_FAILED)
                }
                return transaction
            })
            return transaction
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.UPDATE_TRANSACTION_FAILED, error)
        }
    }

    async deleteTransaction(transactionId: string): Promise<string> {
        try {
            const session = await mongoose.startSession()
            await session.withTransaction(async () => {
                const transaction = await TransactionModel.findOne({ _id: transactionId }).lean()
                if (transaction == null) {
                    throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND)
                }
                const ledgerId = transaction.ledgerId as string
                if (transaction.type === 'income') {
                    await this.dbLedgerManager.incrementTotalIncome(ledgerId, -(transaction.money as number))
                } else {
                    await this.dbLedgerManager.incrementTotalExpense(ledgerId, -(transaction.money as number))
                }
                await TransactionModel.findByIdAndDelete(transactionId)
            })
        } catch (error: Error | any) {
            throw new DBTransactionManagerError(TransactionManagerErrorTypes.TRANSACTION_NOT_FOUND, error)
        }
        return transactionId
    }
}

interface DBTransactionManager {
    TransactionModel: typeof TransactionModel
}

DBTransactionManager.prototype.TransactionModel = TransactionModel

export default DBTransactionManager
