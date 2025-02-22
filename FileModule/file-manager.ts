/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/18.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import fs from 'fs-extra'
import * as pth from 'path'

enum FileManagerError {
    FileNotFound = 'File not found',
}

class FileManager {
    static async createFolderIfNeeded(path: string) {
        await fs.ensureDir(path)
    }

    static async savePhoto(folder: string, name: string, buffer: Buffer) {
        const savePath = pth.join(folder, name)
        await fs.writeFile(savePath, buffer)
    }

    static async readPhoto(path: string): Promise<Buffer> {
        if (!fs.existsSync(path)) {
            throw new Error(FileManagerError.FileNotFound)
        }
        const buffer = await fs.readFile(path)
        return buffer
    }

    static async deletePhoto(path: string) {
        if (!fs.existsSync(path)) {
            throw new Error(FileManagerError.FileNotFound)
        }
        await fs.unlink(path)
    }
}

export default FileManager