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

// TagManager Error Types
enum TagManagerErrorTypes {
    CREATE_TAG_FAILED = 'Failed to create tag',
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

    async createTag(data: ITag): Promise<string> {
        const tagModel = new this.TagModel(data)
        try {
            const saveTag = await tagModel.save()
            return saveTag._id.toString()
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.CREATE_TAG_FAILED, error)
        }
    }

    async getTag(tagId: string): Promise<ITag> {
        let tag: ITag | null = null
        try {
            tag = await this.TagModel.findOne({ _id: tagId }).lean()
            if (tag == null) {
                throw new DBTagManagerError(TagManagerErrorTypes.CREATE_TAG_FAILED)
            }
            return tag
        } catch (error: Error | any) {
            throw new DBTagManagerError(TagManagerErrorTypes.CREATE_TAG_FAILED, error)
        }
    }
}

interface DBTagManager {
    TagModel: typeof TagModel
}

DBTagManager.prototype.TagModel = TagModel

export default DBTagManager