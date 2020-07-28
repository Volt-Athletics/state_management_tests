import { useContext, createContext } from 'react'
import { types, onSnapshot, flow } from 'mobx-state-tree'

import { UserStore } from './UserStore'
import { ProgramStore } from './ProgramStore'
import { WorkoutStore } from './WorkoutStore'

const RootModel = types
  .model({
    user: UserStore,
    program: ProgramStore,
    workout: WorkoutStore,
  })
  .actions((self) => {
    const fetchVitalData = flow(function* () {
      try {
        if (!self.user.profile)
          yield self.user.signIn('ia_default_0_0@v.com', '11111111')

        yield Promise.all([
          self.program.getCustomProgramMembership(),
          self.workout.getSmarSetsReferenceTables(),
          self.program.getProgram(),
          self.workout.getBlockDescriptions(),
        ])

        yield self.workout.getWorkoutWeeks()
        yield self.workout.getWorkout(self.workout.currentWeek.id)
      } catch (e) {
        console.error(e)
      }
    })

    return {
      fetchVitalData,
    }
  })

const rootStore = RootModel.create({
  user: UserStore.create(),
  program: ProgramStore.create(),
  workout: WorkoutStore.create(),
})

const RootStoreContext = createContext(null)
onSnapshot(rootStore, (snapshot) => console.log('Snapshot: ', snapshot))

const Provider = RootStoreContext.Provider

function useMst() {
  const store = useContext(RootStoreContext)
  if (store === null) {
    throw new Error('Store cannot be null, please add a context provider')
  }
  return store
}

export { rootStore, Provider, useMst }
