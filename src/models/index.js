const { sequelize } = require('../config/database');
const { Sequelize } = require('sequelize');

// Import models
const User = require('./User');
const PtClient = require('./PtClient');
const Exercise = require('./Exercise');
const Workout = require('./Workout');
const WorkoutExercise = require('./WorkoutExercise');
const ScheduledWorkout = require('./ScheduledWorkout');
const WorkoutLog = require('./WorkoutLog');
const ExerciseLog = require('./ExerciseLog');
const BodyMeasurement = require('./BodyMeasurement');
const Notification = require('./Notification');

// ===== ASSOCIATIONS =====

// User <-> PtClient (as PT)
User.hasMany(PtClient, { as: 'clients', foreignKey: 'ptId' });
PtClient.belongsTo(User, { as: 'pt', foreignKey: 'ptId' });

// User <-> PtClient (as Client)
User.hasMany(PtClient, { as: 'trainers', foreignKey: 'clientId' });
PtClient.belongsTo(User, { as: 'client', foreignKey: 'clientId' });

// User <-> Workout (PT creates workouts)
User.hasMany(Workout, { as: 'workouts', foreignKey: 'ptId' });
Workout.belongsTo(User, { as: 'pt', foreignKey: 'ptId' });

// Workout <-> WorkoutExercise
Workout.hasMany(WorkoutExercise, { as: 'exercises', foreignKey: 'workoutId', onDelete: 'CASCADE' });
WorkoutExercise.belongsTo(Workout, { foreignKey: 'workoutId' });

// Exercise <-> WorkoutExercise
Exercise.hasMany(WorkoutExercise, { foreignKey: 'exerciseId' });
WorkoutExercise.belongsTo(Exercise, { foreignKey: 'exerciseId' });

// ScheduledWorkout associations
Workout.hasMany(ScheduledWorkout, { foreignKey: 'workoutId' });
ScheduledWorkout.belongsTo(Workout, { foreignKey: 'workoutId' });

User.hasMany(ScheduledWorkout, { as: 'scheduledWorkouts', foreignKey: 'clientId' });
ScheduledWorkout.belongsTo(User, { as: 'client', foreignKey: 'clientId' });
ScheduledWorkout.belongsTo(User, { as: 'pt', foreignKey: 'ptId' });

// ScheduledWorkout <-> WorkoutLog
ScheduledWorkout.hasOne(WorkoutLog, { as: 'log', foreignKey: 'scheduledWorkoutId' });
WorkoutLog.belongsTo(ScheduledWorkout, { foreignKey: 'scheduledWorkoutId' });

// User <-> WorkoutLog
User.hasMany(WorkoutLog, { as: 'workoutLogs', foreignKey: 'clientId' });
WorkoutLog.belongsTo(User, { as: 'client', foreignKey: 'clientId' });

// WorkoutLog <-> ExerciseLog
WorkoutLog.hasMany(ExerciseLog, { as: 'exerciseLogs', foreignKey: 'workoutLogId', onDelete: 'CASCADE' });
ExerciseLog.belongsTo(WorkoutLog, { foreignKey: 'workoutLogId' });

// Exercise <-> ExerciseLog
Exercise.hasMany(ExerciseLog, { foreignKey: 'exerciseId' });
ExerciseLog.belongsTo(Exercise, { foreignKey: 'exerciseId' });

// WorkoutExercise <-> ExerciseLog
WorkoutExercise.hasMany(ExerciseLog, { foreignKey: 'workoutExerciseId' });
ExerciseLog.belongsTo(WorkoutExercise, { foreignKey: 'workoutExerciseId' });

// User <-> BodyMeasurement
User.hasMany(BodyMeasurement, { as: 'bodyMeasurements', foreignKey: 'clientId' });
BodyMeasurement.belongsTo(User, { as: 'client', foreignKey: 'clientId' });

// User <-> Notification
User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

// Export
const db = {
    sequelize,
    Sequelize,
    User,
    PtClient,
    Exercise,
    Workout,
    WorkoutExercise,
    ScheduledWorkout,
    WorkoutLog,
    ExerciseLog,
    BodyMeasurement,
    Notification,
};

module.exports = db;
