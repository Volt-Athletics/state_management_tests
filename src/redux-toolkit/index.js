import React from 'react'
import { Provider, connect } from 'react-redux'

import rootStore from './store'
import { signIn } from './store/user'

const AppView = () => (
  <Provider store={rootStore}>
    <div>
      <button
        onClick={(e) => {
          rootStore.dispatch(signIn('ia_default_0_0@v.com', '11111111'))
        }}
      >
        Sign In
      </button>
    </div>
  </Provider>
)

export default AppView
