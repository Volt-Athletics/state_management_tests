import produce from 'immer'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import service from '../../service'

const programSlice = createSlice({
  name: 'program',
  initialState: { customPrograms: {}, customProgramMemberships: {} },
  reducers: {
    getCustomProgramSucceeded: produce((draft, { payload }) => {
      draft.customPrograms[payload.id] = payload
      return draft
    }),
    getCustomProgramMembershipSucceeded: produce((draft, { payload }) => {
      draft.customProgramMemberships[payload.id] = payload
      return draft
    }),
  },
})

const {
  getCustomProgramSucceeded,
  getCustomProgramMembershipSucceeded,
} = programSlice.actions

export const getCustomProgramMembership = createAsyncThunk(
  getCustomProgramMembershipSucceeded.type,
  async (programMembershipId) => {
    const membership = await service.getCustomProgramMembership(
      programMembershipId
    )

    return membership
  }
)

export const getProgram = (programId) => async (dispatch) => {
  try {
    const program = await service.getProgram(programId)
    dispatch(getCustomProgramSucceeded(program))
  } catch (err) {
    console.err(err)
  }
}

export default programSlice
