import '../styles/globals.css'
import {ThemeProvider} from '@mui/material';
import {theme} from "../styles/theme";
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistStore} from 'redux-persist';
import {useStore} from "../store";
import {SessionProvider} from 'next-auth/react';

function PageLayout({ children, Component }) {
  const getLayout = Component.getLayout || ((page) => page)
  return (
    getLayout(children)
  )
}

function MyApp({Component, pageProps: {session, ...pageProps}}) {
  const store = useStore(pageProps.initialReduxState);
  const persistor = persistStore(store, {}, () => persistor.persist())

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <SessionProvider session={session}>
          <ThemeProvider theme={theme}>
            <PageLayout Component={Component}>
              <Component {...pageProps} />
            </PageLayout>
          </ThemeProvider>
        </SessionProvider>
      </PersistGate>
    </Provider>
  )
}

export default MyApp
