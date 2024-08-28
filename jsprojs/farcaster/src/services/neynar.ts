import { NeynarAPIClient } from '@standard-crypto/farcaster-js'

import { config } from '../config'

export const neynar = new NeynarAPIClient(config.NEYNAR_API_KEY)
