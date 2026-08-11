import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient()

  return {
    queryClient,
    session: null,
  }
}
export default function TanstackQueryProvider() {}
