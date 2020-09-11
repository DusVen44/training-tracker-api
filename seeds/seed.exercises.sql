TRUNCATE exercises RESTART IDENTITY CASCADE;

INSERT INTO exercises (exercise_name, exercise_type, set_count, lbs)
VALUES
    ('Barbell Bench Press', 'Strength', 1, 0),
    ('Dumbbell Bench Press', 'Strength', 1, 0),
    ('Pushups', 'Body', 1, 0),
    ('Dips', 'Body', 1, 0),
    ('Treadmill', 'Cardio', 1, 0),
    ('Elliptical', 'Cardio', 1, 0);