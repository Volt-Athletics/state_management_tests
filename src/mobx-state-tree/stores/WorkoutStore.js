import { types, flow, getRoot } from 'mobx-state-tree'
import parseISO from 'date-fns/parseISO'
import isThisWeek from 'date-fns/isThisWeek'

import service from '../../service'

const { model, maybeNull, string, number, boolean, array, map, union } = types

const SmartSetsReferenceTables = model({
  rpeToOneRepLoading: array(
    model({
      rpe: number,
      loadFactor: number,
    })
  ),
  differentialLoadFactors: array(
    model({
      difference: number,
      loadFactor: number,
    })
  ),
  rpeForIntensityAndReps: array(
    model({
      intensity: number,
      rpeByReps: array(number),
    })
  ),
})

const BlockDescriptionItem = model({
  SHORT: string,
  LONG: string,
})

const BlockDescriptions = model({
  FOUNDATION: BlockDescriptionItem,
  STRENGTH: BlockDescriptionItem,
  POWER: BlockDescriptionItem,
  HYPERTROPHY: BlockDescriptionItem,
  SPEED: BlockDescriptionItem,
  MAX_STRENGTH: BlockDescriptionItem,
  MUSCULAR_ENDURANCE: BlockDescriptionItem,
  STRENGTH_CAPACITY: BlockDescriptionItem,
  UNLOAD: BlockDescriptionItem,
  OFF: BlockDescriptionItem,
})

const WorkoutWeeks = array(
  model({
    id: number,
    weekStartDate: string,
    phaseType: string,
    phaseTypeLabel: string,
    blockTypeLabel: string,
    blockVariation: number,
    blockWithinPhase: maybeNull(number),
    weeksInBlock: maybeNull(number),
    weekWithinBlock: number,
    weekWithinPhase: number,
    intensityLevel: number,
    isPrimary: boolean,
    blockType: string,
    daysInWeek: maybeNull(number),
    trainingDays: array(
      model({
        dayNum: number,
        warmupCompletedAt: maybeNull(string),
        warmupCompletedIdentifier: maybeNull(string),
        startedAt: maybeNull(string),
        concludedAt: maybeNull(string),
        hasNotes: boolean,
        questionnaires: model({
          pretraining: model({
            id: number,
            locator: string,
            'completed?': boolean,
          }),
        }),
      })
    ),
  })
)

const Workout = model({
  id: number,
  customProgramId: number,
  weekStartDate: string,
  phaseType: string,
  phaseTypeLabel: maybeNull(string),
  blockVariation: number,
  blocksInPhase: number,
  blockWithinPhase: number,
  weeksInBlock: number,
  weekWithinBlock: number,
  intensityLevel: number,
  isPrimary: boolean,
  individualized: maybeNull(boolean),
  workoutDayNum: number,
  blockType: string,
  blockTypeLabel: maybeNull(string),
  activeWorkout: maybeNull(boolean),
  warmupCompletedAt: maybeNull(string),
  warmupCompletedIdentifier: maybeNull(string),
  completed: boolean,
  startedAt: maybeNull(string),
  concludedAt: maybeNull(string),
  teamNote: maybeNull(string),
  athleteNote: maybeNull(string),
  conditioningPlans: array(
    model({
      name: string,
      description: string,
      url: string,
      mobileImageUrl: string,
    })
  ),
  movementData: array(
    model({
      coreLiftReference: maybeNull(string),
      animatedGif: model({
        defaultUrl: string,
      }),
      repCaptureType: string,
      name: string,
      repsEachSide: boolean,
      repType: string,
      primaryImage: model({
        smallUrl: string,
        defaultUrl: string,
      }),
      loadCaptureType: maybeNull(string),
      id: number,
      movementCode: string,
      shortDemoVideo: model({
        defaultUrl: string,
      }),
      category: string,
      subCategory: string,
      smartSetsEnabled: boolean,
    })
  ),
  movementGroupings: array(
    model({
      movements: array(
        model({
          id: number,
          rest: number,
          sets: array(
            model({
              rest: number,
              actual: maybeNull(
                model({
                  reps: string,
                  loadValue: string,
                  repsNumeric: number,
                  asPrescribed: boolean,
                  loadValueNumeric: number,
                })
              ),
              setNum: number,
              prescribed: model({
                reps: string,
                loadValue: maybeNull(union(number, string)),
                repsNumeric: number,
                loadValueNumeric: number,
                loadFactor: maybeNull(number),
                priorOneRepMax: maybeNull(number),
              }),
              movementId: number,
              compositeId: string,
              groupingNum: number,
              movementNum: number,
              originallyPrescribedMovementId: number,
            })
          ),
          calibrate: boolean,
          setCount: number,
          compositeId: string,
          groupingNum: number,
          movementNum: number,
          movementCode: string,
          coreLiftReference: maybeNull(string),
          originallyPrescribedMovementId: number,
        })
      ),
      compositeId: string,
      groupingNum: number,
    })
  ),
  movementModifiers: array(
    model({
      new: model({
        id: number,
        name: string,
        movement_code: string,
      }),
      old: model({
        id: number,
        name: string,
        movement_code: string,
      }),
      movement_swap_id: number,
    })
  ),
  questionnaires: model({
    pretraining: model({
      id: number,
      locator: string,
      'completed?': boolean,
    }),
  }),
})

export const WorkoutStore = model({
  workouts: map(Workout),
  workoutWeeks: maybeNull(WorkoutWeeks),
  smartSetsReferenceTables: maybeNull(SmartSetsReferenceTables),
  blockDescriptions: maybeNull(BlockDescriptions),
})
  .views((self) => {
    return {
      get currentWeek() {
        if (!self.workoutWeeks) return null

        return (
          self.workoutWeeks.find((week) =>
            isThisWeek(parseISO(week.weekStartDate))
          ) || null
        )
      },

      get root() {
        return getRoot(self)
      },
    }
  })
  .actions((self) => {
    const getSmarSetsReferenceTables = flow(function* () {
      const tables = yield service.getSmarSetsReferenceTables()
      self.smartSetsReferenceTables = tables
    })

    const getBlockDescriptions = flow(function* () {
      const descriptions = yield service.getBlockTypeDescriptions()
      self.blockDescriptions = descriptions
    })

    const getWorkoutWeeks = flow(function* () {
      const { personId } = self.root.user.profile
      const programId = self.root.program.currentProgram.id

      const weeks = (yield service.getWorkoutWeeks({
        personId,
        programId,
      })).filter((week) => week.id !== null)

      self.workoutWeeks = weeks
    })

    const getWorkout = flow(function* (weekId) {
      const { personId } = self.root.user.profile
      const workout = yield service.getWorkout({ personId, weekId, dayNum: 1 })
      self.workouts.set(`${workout.id}/${workout.workoutDayNum}`, workout)
    })

    return {
      getWorkout,
      getWorkoutWeeks,
      getBlockDescriptions,
      getSmarSetsReferenceTables,
    }
  })
