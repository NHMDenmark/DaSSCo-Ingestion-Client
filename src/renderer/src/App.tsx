import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import Layout from './components/layout/Layout'
import { theme } from './theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <MantineProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Layout/>
      </QueryClientProvider>
    </MantineProvider>
  )
}

export default App
