import React from 'react'
import { observer } from 'mobx-react'
import { connectReduxDevtools } from 'mst-middlewares'

import { rootStore, Provider } from './stores'

import UserInfo from './components/UserInfo'

connectReduxDevtools(require('remotedev'), rootStore)

const AppView = observer((props) => (
  <Provider value={rootStore}>
    <div>
      <button
        onClick={(e) => {
          rootStore.fetchVitalData()
        }}
      >
        Sign In
      </button>
      <UserInfo />
    </div>
  </Provider>
))

export default () => <AppView />
