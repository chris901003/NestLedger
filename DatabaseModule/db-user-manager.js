/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/01/22.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import { mongoose } from './db-connect.js'
import { Schema } from "mongoose"

const DBUserManagerErrorType = Object.freeze({
    USER_NOT_FOUND: 'User not found',
    DATABASE_ERROR: 'Database error'
})

class DBUserManagerError extends Error {
    constructor(errorType, rawError) {
        super(errorType)
        this.name = 'DBUserManagerError'
        this.code = errorType
        this.rawError = rawError

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DBUserManagerError)
        }
    }
}

class DBUserManager {
    constructor() { }

    async getUserInfo(uid) {
        let userInfo
        try {
            userInfo = await this.UserInfoModel.findOne({ uid: uid })
        } catch (error) {
            throw new DBUserManagerError(DBUserManagerErrorType.DATABASE_ERROR, error)
        }
        if (!userInfo) {
            throw new DBUserManagerError(DBUserManagerErrorType.USER_NOT_FOUND, null)
        }
        return userInfo
    }

    async #createUserInfo(uid) {
        const userInfo = new this.UserInfoModel({ uid: uid })
        try {
            await userInfo.save()
        } catch (error) {
            throw new DBUserManagerError(DBUserManagerErrorType.DATABASE_ERROR, error)
        }
    }

    async createUserInfoIfNeeded(uid) {
        try {
            await this.getUserInfo(uid)
        } catch (error) {
            if (error.code === DBUserManagerErrorType.USER_NOT_FOUND) {
                await this.#createUserInfo(uid)
            } else {
                throw error
            }
        }
    }
}

DBUserManager.prototype.UserInfoSchema = new Schema({
    'uid': {
        type: String,
        required: true,
        unique: true
    }
})

DBUserManager.prototype.UserInfoModel = mongoose.model('UserInfo', DBUserManager.prototype.UserInfoSchema)

export { DBUserManager, DBUserManagerError, DBUserManagerErrorType }