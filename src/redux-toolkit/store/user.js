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
    updateUserName: produce((draft, { payload }) => {
      if (!draft.profile) return draft
      draft.profile.displayName = payload
      return draft
    }),
  },
})

const { getProfileSucceeded, updateUserName } = userSlice.actions

export { updateUserName }

export const signIn = (email, password) => async (dispatch) => {
  try {
    const profile = await service.signIn(email, password)
    dispatch(getProfileSucceeded(profile))
  } catch (err) {
    console.err(err)
  }
}

export const selectProfile = (state) => state.user.profile

export const selectOrganizations = createSelector(selectProfile, (profile) => {
  if (!profile) return null
  return profile.organizations
})

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
  if (!profile) return null
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
    return [...args]
      .filter(Boolean)
      .some((contextGroup) => !!contextGroup.length)
  }
)

export const selectPendingIndySetupContext = createSelector(
  selectIsIneligibleForIndySetup,
  selectProfile,
  (isIneligibleForIndySetup, profile) => {
    if (isIneligibleForIndySetup || !profile) return null

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
      ...(indyContexts || []),
      ...(teamPlayerContexts || []),
      ...(selfDirectedTrainingContexts || []),
    ]

    pendingIndySetupContex && supportedContexts.push(pendingIndySetupContex)
    return supportedContexts
  }
)

export const selectClientSelectedContextToken = createSelector(
  selectSupportedContexts,
  (supportedContexts) => {
    const currentContext = supportedContexts.find(
      (context) => context['selected?']
    )

    if (currentContext) {
      return currentContext.contextToken
    } else if (supportedContexts.length) {
      // likely a coach as they will not be included in supportedContexts
      // If they do have any supported contexts, default to using the first one
      return supportedContexts[0].contextToken
    }

    return null
  }
)

export const selectSelectedContext = createSelector(
  selectClientSelectedContextToken,
  selectSupportedContexts,
  (token, supportedContexts) => {
    if (!token) return null
    return supportedContexts.find((context) => context.contextToken === token)
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
