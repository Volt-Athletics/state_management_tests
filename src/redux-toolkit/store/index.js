import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import user, { signIn, selectSelectedContext } from './user'
// import workout from './workout'
import program, { getProgram } from './program'

const store = configureStore({
  reducer: combineReducers({ user: user.reducer, program: program.reducer }),
})

export async function fetchVitalData() {
  await store.dispatch(signIn('ia_default_0_0@v.com', '11111111'))
  const { programId } = selectSelectedContext(store.getState())
  await store.dispatch(getProgram(programId))
}

export default store
