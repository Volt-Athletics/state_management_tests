import { types, flow, getRoot } from 'mobx-state-tree'

import service from '../service'

const {
  model,
  map,
  string,
  boolean,
  identifierNumber,
  array,
  maybeNull,
  number,
} = types

const CustomProgramMembership = model({
  currentWeekStartDate: string,
  id: identifierNumber,
  trainAtYourOwnPace: boolean,
})

const SupplementalAsset = model({
  name: string,
  description: maybeNull(string),
  mobileImageUrl: string,
})

const CustomProgram = model({
  id: number,
  teamId: maybeNull(number),
  name: string,
  generatorProgramSeedId: number,
  smartSetsEnabled: boolean,
  athletesCanSwap: boolean,
  trainingCalendarDetails: model({
    offDates: array(string),
    unloadDates: array(string),
    primaryCompEnd: maybeNull(string),
    primaryCompStart: maybeNull(string),
    secondaryCompEnd: maybeNull(string),
    secondaryCompStart: maybeNull(string),
    primaryTrainingStart: maybeNull(string),
    primaryCompFoundation: boolean,
    primaryPrepFoundation: boolean,
    secondaryTrainingStart: maybeNull(string),
    secondaryCompFoundation: boolean,
    secondaryPrepFoundation: boolean,
  }),
  startDate: maybeNull(string),
  currentWeekStartDate: maybeNull(string),
  primary: model({
    startTraining: string,
    startDate: string,
    endDate: string,
  }),
  secondary: model({
    startTraining: maybeNull(string),
    startDate: maybeNull(string),
    endDate: maybeNull(string),
  }),
  generatorProgramSeed: model({
    id: number,
    code: string,
    marketingDescription: maybeNull(string),
    description: maybeNull(string),
    level: number,
    premium: boolean,
    name: string,
    trainingPerformanceFactors: array(
      model({
        internalName: string,
        description: string,
        factorType: string,
        title: string,
        iconUrl: string,
      })
    ),
    sportId: number,
    requireUserDate: boolean,
    sampleWorkoutUrl: maybeNull(string),
    logoImage: model({
      defaultUrl: string,
    }),
    conditioningPlans: array(SupplementalAsset),
    warmUps: array(SupplementalAsset),
    primers: array(SupplementalAsset),
    finishers: array(SupplementalAsset),
    saqs: array(SupplementalAsset),
  }),
  conditioningPlans: array(SupplementalAsset),
  warmUps: array(SupplementalAsset),
  primers: array(SupplementalAsset),
  finishers: array(SupplementalAsset),
  saqs: array(SupplementalAsset),
})

export const ProgramStore = model({
  customProgramMemberships: map(CustomProgramMembership),
  customPrograms: map(CustomProgram),
})
  .actions((self) => {
    const selectedContext = () => getRoot(self).user.profile.selectedContext

    const getCustomProgramMembership = flow(function* () {
      const { programMembershipId } = selectedContext()

      const customProgramMembership = yield service.getCustomProgramMembership(
        programMembershipId
      )

      self.customProgramMemberships.set(
        programMembershipId,
        customProgramMembership
      )

      return customProgramMembership
    })

    const getProgram = flow(function* () {
      const { programId } = selectedContext()
      const program = yield service.getProgram(programId)
      self.customPrograms.set(program.id, program)
    })

    return { getCustomProgramMembership, getProgram }
  })
  .views((self) => {
    return {
      get currentProgram() {
        const { programId } = getRoot(self).user.profile.selectedContext
        return self.customPrograms.get(programId) || null
      },
    }
  })
