/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/16.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import mongoose from './db-connect'
import { Schema, Document, model, InferSchemaType } from 'mongoose'

// UserInfoManager Error Types
enum UserInfoManagerErrorTypes {
    USER_INFO_NOT_FOUND = 'User information not found',
    FIND_USER_INFO_FAILED = 'Failed to find user information',
    CREATE_USER_INFO_FAILED = 'Failed to create user information',
}

class DBUserInfoManagerError extends Error {
    code: string
    rawError: Error | undefined
    constructor(type: UserInfoManagerErrorTypes, rawError?: Error) {
        super(type)
        this.name = 'DBUserInfoManagerError'
        this.code = type
        this.message = type
        this.rawError = rawError
    }
}

// Define the data structure of the user information

const UserInfoSchema: Schema = new Schema({
    id: { type: String, required: true },
    userName: { type: String, default: '' },
    emailAddress: { type: String, default: '' },
    avatar: { type: String, default: '' },
    timeZone: { type: Number, default: 8 },
    imageQuality: { type: Number, default: 0.5 },
    ledgerIds: { type: [String], default: [] },
    isDelete: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
})

type IUserInfo = InferSchemaType<typeof UserInfoSchema>
type IUserInfoDocument = IUserInfo & Document

const UserInfoModel = mongoose.model<IUserInfoDocument>('UserInfo', UserInfoSchema)

// Define the class to manage the user information in the database

class DBUserInfoManager {
    constructor() { }

    async getUserInfo(uid: string): Promise<IUserInfo> {
        let userInfo: IUserInfo | null = null
        try {
            userInfo = await this.UserInfoModel.findOne({ id: uid }).lean()
        } catch (error: Error | any) {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.FIND_USER_INFO_FAILED, error)
        }
        if (!userInfo) {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.USER_INFO_NOT_FOUND)
        }
        return userInfo
    }

    async createUserInfo(userInfo: IUserInfo) {
        const userInfoModel = new this.UserInfoModel(userInfo)
        try {
            await userInfoModel.save()
        } catch (error: Error | any) {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.CREATE_USER_INFO_FAILED, error)
        }
    }

    async createUserInfoIfNeeded(uid: string) {
        try {
            await this.getUserInfo(uid)
        } catch (error: DBUserInfoManagerError | any) {
            if (error.code === UserInfoManagerErrorTypes.USER_INFO_NOT_FOUND) {
                await this.createUserInfo({ id: uid })
            } else {
                throw error
            }
        }
    }

    async getUserInfoByEmail(email: string): Promise<IUserInfo> {
        try {
            const userInfo = await this.UserInfoModel.findOne({ emailAddress: email }).lean()
            if (!userInfo) {
                throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.USER_INFO_NOT_FOUND)
            }
            return userInfo
        } catch (error: Error | any) {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.FIND_USER_INFO_FAILED, error)
        }
    }

    async getMultipleUserInfo(uids: string[]): Promise<IUserInfo[]> {
        let userInfos: IUserInfo[] = []
        try {
            userInfos = await this.UserInfoModel.find({ id: { $in: uids } }).lean()
        } catch {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.FIND_USER_INFO_FAILED)
        }
        return userInfos
    }

    async deleteUserInfo(uid: string) {
        try {
            let userInfo = await this.UserInfoModel.findOne({ id: uid }).lean()
            if (!userInfo) {
                throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.USER_INFO_NOT_FOUND)
            }
            userInfo.isDelete = true
            await this.UserInfoModel.findOneAndUpdate(
                { id: uid },
                userInfo,
                {
                    new: true,
                    runValidators: true
                }
            ).lean()
        } catch (error: Error | any) {
            throw new DBUserInfoManagerError(UserInfoManagerErrorTypes.FIND_USER_INFO_FAILED, error)
        }
    }
}

interface DBUserInfoManager {
    UserInfoModel: typeof UserInfoModel
}

DBUserInfoManager.prototype.UserInfoModel = UserInfoModel

export default DBUserInfoManager