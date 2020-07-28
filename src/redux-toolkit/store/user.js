import produce from 'immer'
import { createSlice } from '@reduxjs/toolkit'
import service from '../../service'

const userSlice = createSlice({
  name: 'user',
  initialState: { profile: null },
  reducers: {
    getProfileSucceeded: produce((draft, { payload }) => {
      draft.profile = payload
      return draft
    }),
  },
})

const { getProfileSucceeded } = userSlice.actions

export const signIn = (email, password) => async (dispatch) => {
  try {
    const profile = await service.signIn(email, password)
    dispatch(getProfileSucceeded(profile))
  } catch (err) {
    console.err(err)
  }
}

export default userSlice
