import React from 'react'
import { Provider, connect } from 'react-redux'

import rootStore, { fetchVitalData } from './store'
import { signIn } from './store/user'
import UserInfo from './components/UserInfo'

const AppView = () => (
  <Provider store={rootStore}>
    <div>
      <button onClick={fetchVitalData}>Sign In</button>
      <UserInfo />
    </div>
  </Provider>
)

export default AppView
