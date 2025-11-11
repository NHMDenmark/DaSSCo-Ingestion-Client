import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import Layout from './components/layout/Layout'
import { theme } from './theme'
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import toast, { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => toast.error(`Something went wrong: ${error.message}`)
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => toast.error(`Action failed: ${error.message}`)
  }),
});

const App = (): JSX.Element => {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Layout />
        <Toaster position='bottom-center' />
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default App
