import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { authClient } from './auth-client'
import { auth } from './auth'

export const getSession = createIsomorphicFn()
  .server(async () => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })
    return session ?? null
  })
  .client(async () => {
    const { data } = await authClient.getSession()
    return data ?? null
  })