import { types, flow } from 'mobx-state-tree'
import { isEmpty } from 'lodash'

import service from '../service'

const {
  optional,
  model,
  maybeNull,
  string,
  number,
  boolean,
  array,
  enumeration,
  identifierNumber,
} = types

const Gender = enumeration('Gender', ['MALE', 'FEMALE', 'NEUTRAL'])
const Image = model({ defaultUrl: string })

const Context = model({
  contextToken: string,
  contextType: string,
  customPackageId: maybeNull(number),
  programId: maybeNull(number),
  name: maybeNull(string),
  sport: maybeNull(string),
  teamId: maybeNull(number),
  participantTerm: maybeNull(string),
  programMembershipId: maybeNull(number),
  'selected?': boolean,
  heroImage: maybeNull(Image),
  sportCode: maybeNull(string),
  workoutWeekId: maybeNull(number),
  workoutWeekDayNum: maybeNull(number),
  complianceMode: maybeNull(boolean),
  secondaryText: maybeNull(string),
  primaryText: maybeNull(string),
  defaultLogoImageUrl: string,
  signupToken: maybeNull(string),
  concludableSignup: maybeNull(boolean),
  videoResourceId: maybeNull(string),
})

const Organization = model({
  primaryText: maybeNull(string),
  secondaryText: maybeNull(string),
  primaryColor: maybeNull(string),
  secondaryColor: maybeNull(string),
  tertiaryText: maybeNull(string),
  teamCreateAuthorized: boolean,
  teamsCoachingOn: array(Context),
  teamsPlayingOn: array(Context),
  selfDirectedTrainingPrograms: array(Context),
})

const CustomPackage = model({
  id: identifierNumber,
  ownerId: number,
  ownerType: string,
  paymentServiceIdentifier: maybeNull(string),
  basePackage: model({
    appStoreEnabled: boolean,
    id: number,
    playStoreEnabled: boolean,
  }),
  features: model({
    includedSportIds: array(number),
    includedSeedIds: array(number),
    toggles: model({
      nutritionCenterToggleAccessOn: boolean,
      mediaHubToggleAccessOn: boolean,
      saqsToggleAccessOn: boolean,
      customMetricsToggleAccessOn: boolean,
      finishersToggleAccessOn: boolean,
      warmUpsToggleAccessOn: boolean,
      readinessQuestionnaireToggleAccessOn: boolean,
      complianceModeToggleAccessOn: boolean,
      primersToggleAccessOn: boolean,
      conditioningToggleAccessOn: boolean,
    }),
  }),
})

const Profile = model({
  needsAttribution: maybeNull(boolean),
  hasLimitedAdTracking: boolean,
  bodyWeightInLbs: maybeNull(number),
  dateOfBirth: maybeNull(string),
  displayName: string,
  email: string,
  firstName: string,
  gender: maybeNull(Gender),
  globalTrackingId: string,
  heightInInches: maybeNull(number),
  lastName: string,
  personId: number,
  unitSystem: optional(string, 'IMPERIAL'),
  userId: number,
  currentCustomPackage: CustomPackage,
  currentContextToken: string,
  profileImage: Image,
  anonymize: maybeNull(boolean),
  showPretrainingQuestionnaire: boolean,
  organizations: array(Organization),
  independentAthlete: model({
    trainingPrograms: array(Context),
    pendingIndependentSetup: maybeNull(Context),
  }),
}).views((self) => {
  function _getContextsFromOrg(
    fromArray,
    requireProgramId = true
  ): ContextType[] {
    const contexts = []
    const { organizations } = self

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

  return {
    get selfDirectedTrainingContexts() {
      return _getContextsFromOrg('selfDirectedTrainingPrograms')
    },

    get indyContexts() {
      const {
        independentAthlete: { trainingPrograms = [] },
      } = self

      return trainingPrograms.filter((program) => !isEmpty(program))
    },

    get teamPlayerContexts() {
      return _getContextsFromOrg('teamsPlayingOn')
    },

    get coachContexts() {
      return _getContextsFromOrg('teamsCoachingOn', false)
    },

    get isIneligibleForIndySetup(): boolean {
      return (
        !!self.indyContexts.length ||
        !!self.teamPlayerContexts.length ||
        !!self.coachContexts.length ||
        !!self.selfDirectedTrainingContexts.length
      )
    },

    get pendingIndySetupContext() {
      if (self.isIneligibleForIndySetup) {
        return null
      }

      const {
        independentAthlete: { pendingIndependentSetup },
      } = self

      if (pendingIndependentSetup && !isEmpty(pendingIndependentSetup)) {
        return pendingIndependentSetup
      }

      return null
    },

    get isPendingIndySetup() {
      return !!self.pendingIndySetupContext
    },

    get supportedContexts() {
      const indySetup = self.pendingIndySetupContext
      const supportedContexts = [
        ...self.indyContexts,
        ...self.teamPlayerContexts,
        ...self.selfDirectedTrainingContexts,
      ]

      indySetup && supportedContexts.push(indySetup)
      return supportedContexts
    },

    get selectedContext() {
      if (!self.clientSelectedContextToken) return null
      return self.supportedContexts.find(
        (context) => context.contextToken === self.clientSelectedContextToken
      )
    },

    get clientSelectedContextToken(): string | null {
      const currentContext = self.supportedContexts.find(
        (context) => context['selected?']
      )

      if (currentContext) {
        return currentContext.contextToken
      } else if (self.supportedContexts.length) {
        // likely a coach as they will not be included in supportedContexts
        // If they do have any supported contexts, default to using the first one
        return self.supportedContexts[0].contextToken
      }

      return null
    },

    get shouldUseTeamApp() {
      return self.supportedContexts.length
    },

    get shouldUpdateSelectedContextOnServer() {
      return (
        self.clientSelectedContextToken !== self.currentContextToken &&
        !self.shouldUseTeamApp
      )
    },
  }
})

export const UserStore = model({ profile: maybeNull(Profile) }).actions(
  (self) => {
    const signIn = flow(function* (email, password) {
      const profile = yield service.signIn(email, password)
      self.profile = profile
      return profile
    })

    return { signIn }
  }
)
