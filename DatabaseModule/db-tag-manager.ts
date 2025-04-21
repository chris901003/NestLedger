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
import DBTransactionManager from './db-transaction-manager'

// TagManager Error Types
enum TagManagerErrorTypes {
    CREATE_TAG_FAILED = 'Failed to create tag',
    TAG_NOT_FOUND = 'Tag not found',
    UPDATE_TAG_FAILED = 'Failed to update tag',
    TAG_STILL_USED = 'Tag still used in transaction',
}

class DBTagManagerError extends Error {
    code: string
    rawError: Error | undefined
    constructor(type: TagManagerErrorTypes, rawError?: Error) {
        super(type)
        this.name = 'DBTagManagerError'
        this.code = type
        this.message = type
        this.rawError = rawError
    }
}

// Define the data structure of the ledger

const TagSchema: Schema = new Schema({
    label: { type: String, required: true },
    color: { type: String, required: true },
    ledgerId: { type: String, required: true },
    version: { type: Number, default: 1 },
})

type ITag = InferSchemaType<typeof TagSchema> & { _id: Types.ObjectId }
type ITagDocument = ITag & Document

const TagModel = mongoose.model<ITagDocument>('Tag', TagSchema)

// Define the class to manage the tag in the database

class DBTagManager {
    constructor() { }

    async createTag(data: ITag): Promise<ITag> {
        const tagModel = new this.TagModel(data)
        try {
            const saveTag = await tagModel.save()
            return saveTag
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.CREATE_TAG_FAILED, error)
        }
    }

    async getTag(tagId: string): Promise<ITag> {
        let tag: ITag | null = null
        try {
            tag = await this.TagModel.findOne({ _id: tagId }).lean()
            if (tag == null) {
                throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND)
            }
            return tag
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND, error)
        }
    }

    async getTags(ledgerId: string, search: string | undefined, page: number = 0, limit: number = 100): Promise<ITag[]> {
        let tags: ITag[] = []
        try {
            const query = search ? { ledgerId, label: { $regex: search, $options: 'i' } } : { ledgerId }
            if (page <= 0) {
                tags = await this.TagModel.find(query).lean()
            } else {
                tags = await this.TagModel.find(query)
                    .sort({ _id: 1})
                    .skip((page - 1) * limit)
                    .limit(limit)
            }
            return tags
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND, error)
        }
    }

    async updateTag(tagId: string, updateInfo: ITag): Promise<ITag> {
        try {
            const updateTag = await this.TagModel.findByIdAndUpdate
                (
                    tagId,
                    updateInfo,
                    {
                        new: true,
                        runValidators: true
                    }
                ).lean()
            if (!updateTag) {
                throw new DBTagManagerError(TagManagerErrorTypes.UPDATE_TAG_FAILED)
            }
            return updateTag
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.UPDATE_TAG_FAILED, error)
        }
    }

    async deleteTag(tagId: string) {
        try {
            let tag = await this.TagModel.findOne({ _id: tagId }).lean()
            if (tag == null) {
                throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND)
            }
            // Check if the tag is used in any transaction
            // If it is used, do not delete it
            let transactionManager = new DBTransactionManager()
            let transactions = await transactionManager.getTransactionByLedger(
                tag.ledgerId as string, undefined, undefined, undefined, tagId, undefined, undefined
            )
            if (transactions.length > 0) {
                throw new DBTagManagerError(TagManagerErrorTypes.TAG_STILL_USED)
            }
            await this.TagModel.findByIdAndDelete(tagId)
        } catch (error: Error | any) {
            if (error instanceof DBTagManagerError) {
                throw error
            }
            throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND, error)
        }
    }

    async deleteTags(ledgerId: string) {
        try {
            await this.TagModel.deleteMany({ ledgerId: ledgerId })
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.TAG_NOT_FOUND, error)
        }
    }
}

interface DBTagManager {
    TagModel: typeof TagModel
}

DBTagManager.prototype.TagModel = TagModel

export default DBTagManager