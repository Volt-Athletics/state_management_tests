import React from 'react'
import { observer } from 'mobx-react'

import { rootStore, Provider, useMst } from './stores'

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
    </div>
  </Provider>
))

export default () => <AppView />
