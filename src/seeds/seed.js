const { Exercise } = require('../models');

const MUSCLE_GROUPS = ['chest', 'back', 'shoulders', 'legs', 'arms', 'core'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const EQUIPMENT = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell'];

function generateExercises(count = 105) {
    const exercises = [];
    let idCounter = 1;

    for (const group of MUSCLE_GROUPS) {
        // Generate roughly equal amount per muscle group
        const countPerGroup = Math.ceil(count / MUSCLE_GROUPS.length);

        for (let i = 0; i < countPerGroup; i++) {
            const diff = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
            const equip = EQUIPMENT[Math.floor(Math.random() * EQUIPMENT.length)];

            exercises.push({
                name: `${equip} ${group.charAt(0).toUpperCase() + group.slice(1)} Exercise ${i + 1}`,
                muscleGroup: group,
                description: `A fundamental ${diff} ${equip.toLowerCase()} exercise for targeting the ${group} muscles. Keep core tight and ensure full range of motion.`,
                difficulty: diff,
                equipment: equip,
                youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Dummy valid youtube embed
                imageUrl: null
            });
            idCounter++;
        }
    }
    return exercises;
}

// Ensure proper async wrapper if executed directly
async function runSeed() {
    try {
        console.log('Seeding exercises...');
        const exercises = generateExercises();

        // Use bulkCreate to insert all at once
        await Exercise.bulkCreate(exercises, { ignoreDuplicates: true });

        console.log(`Successfully seeded ${exercises.length} exercises!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding exercises:', err);
        process.exit(1);
    }
}

if (require.main === module) {
    runSeed();
} else {
    module.exports = runSeed;
}
