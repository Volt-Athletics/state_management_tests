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

export const getProgram = createAsyncThunk(
  getCustomProgramSucceeded.type,
  async (programId) => {
    const program = await service.getProgram(programId)
    return program
  }
)

export default programSlice
