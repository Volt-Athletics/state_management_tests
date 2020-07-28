import { combineReducers } from 'redux'
import { configureStore, createAsyncThunk } from '@reduxjs/toolkit'

import user, { signIn } from './user'
// import workout from './workout'
import program from './program'

const store = configureStore({
  reducer: combineReducers({ user: user.reducer, program: program.reducer }),
})

export async function fetchVitalData() {
  await signIn('ia_default_0_0@v.com', '11111111')
}

export default store
