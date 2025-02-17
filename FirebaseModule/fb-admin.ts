/*
 * =============================================================================
 * Created by Zephyr-Huang on 2025/02/17.
 * Copyright © 2025 Zephyr-Huang. All rights reserved.
 *
 * Unauthorized copying of this file, via any medium, is strictly prohibited.
 * Proprietary and confidential.
 * =============================================================================
*/

import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

const serviceAccount = {
    type: process.env.FBA_type,
    project_id: process.env.FBA_project_id,
    private_key_id: process.env.FBA_private_key_id,
    private_key: (process.env.FBA_private_key as string).replace(/\\n/g, '\n'),
    client_email: process.env.FBA_client_email,
    client_id: process.env.FBA_client_id,
    auth_uri: process.env.FBA_auth_uri,
    token_uri: process.env.FBA_token_uri,
    auth_provider_x509_cert_url: process.env.FBA_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.FBA_client_x509_cert_url,
    universal_domain: process.env.FBA_universe_domain
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
})

export default admin