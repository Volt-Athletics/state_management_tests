import produce from 'immer'
import { isEmpty } from 'lodash'
import { createSlice, createSelector } from '@reduxjs/toolkit'
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

export const selectProfile = (state) => state.user.profile

export const selectOrganizations = createSelector(
  selectProfile,
  (profile) => profile.organizations
)

export const selectSelfDirectedTrainingContexts = createSelector(
  selectOrganizations,
  (orgs) => _getContextsFromOrg(orgs, 'selfDirectedTrainingPrograms')
)

export const selectTeamPlayerContexts = createSelector(
  selectOrganizations,
  (orgs) => _getContextsFromOrg(orgs, 'teamsPlayingOn')
)

export const selectCoachContexts = createSelector(selectOrganizations, (orgs) =>
  _getContextsFromOrg(orgs, 'teamsCoachingOn', true)
)

export const selectIndyContexts = createSelector(selectProfile, (profile) => {
  const {
    independentAthlete: { trainingPrograms = [] },
  } = profile

  return trainingPrograms.filter((program) => !isEmpty(program))
})

export const selectIsIneligibleForIndySetup = createSelector(
  selectIndyContexts,
  selectTeamPlayerContexts,
  selectCoachContexts,
  selectSelfDirectedTrainingContexts,
  (...args) => {
    return [...args].some((contextGroup) => !!contextGroup.length)
  }
)

export const selectPendingIndySetupContext = createSelector(
  selectIsIneligibleForIndySetup,
  selectProfile,
  (isIneligibleForIndySetup, profile) => {
    if (isIneligibleForIndySetup) return null

    const {
      independentAthlete: { pendingIndependentSetup },
    } = profile

    if (pendingIndependentSetup && !isEmpty(pendingIndependentSetup)) {
      return pendingIndependentSetup
    }

    return null
  }
)

export const selectSupportedContexts = createSelector(
  selectPendingIndySetupContext,
  selectIndyContexts,
  selectTeamPlayerContexts,
  selectSelfDirectedTrainingContexts,
  (
    pendingIndySetupContex,
    indyContexts,
    teamPlayerContexts,
    selfDirectedTrainingContexts
  ) => {
    const supportedContexts = [
      ...indyContexts,
      ...teamPlayerContexts,
      ...selfDirectedTrainingContexts,
    ]

    pendingIndySetupContex && supportedContexts.push(pendingIndySetupContex)
    return supportedContexts
  }
)

function _getContextsFromOrg(
  organizations,
  fromArray,
  requireProgramId = true
): ContextType[] {
  const contexts = []

  if (organizations && organizations.length) {
    for (const org of organizations) {
      if (org[fromArray] && org[fromArray].length) {
        org[fromArray].forEach(
          (context) =>
            !isEmpty(context) &&
            (requireProgramId ? !!context.programId : true) &&
            contexts.push(context)
        )
      }
    }
  }

  return contexts
}

export default userSlice
