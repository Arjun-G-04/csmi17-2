import React from 'react';
import { Assignment, Course, Teacher, Room, TimeSlot, StudentGroup } from '../types';

interface TimetableDisplayProps {
    solution: Assignment | null;
    courses: Course[];
    teachers: Teacher[];
    rooms: Room[];
    timeSlots: TimeSlot[];
    studentGroups: StudentGroup[];
    status: 'idle' | 'solving' | 'solved' | 'failed';
    stats: { timeTaken: number; nodesVisited: number } | null;
}

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <svg className="animate-spin-slow h-16 w-16 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-semibold">Generating Timetable...</p>
        <p className="text-gray-500 dark:text-gray-400">The AI is exploring thousands of possibilities.</p>
    </div>
);

const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-4 text-2xl font-bold">Timetable will appear here</h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
            Fill in your data on the left, choose an algorithm, and click "Generate Timetable" to start.
        </p>
    </div>
);

const ResultMessage: React.FC<{ success: boolean; stats: { timeTaken: number; nodesVisited: number } | null }> = ({ success, stats }) => (
    <div className={`p-4 rounded-lg mb-4 text-center ${success ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
        <h4 className="font-bold text-lg">{success ? 'Solution Found!' : 'No Solution Found'}</h4>
        {stats && (
            <p className="text-sm">
                Time taken: {stats.timeTaken.toFixed(2)} ms | Nodes visited: {stats.nodesVisited.toLocaleString()}
            </p>
        )}
    </div>
);

const SummaryStats: React.FC<{
    solution: Assignment;
    courses: Course[];
    teachers: Teacher[];
    studentGroups: StudentGroup[];
}> = ({ solution, courses, teachers, studentGroups }) => {
    
    const getScheduledHours = (id: string, type: 'teacher' | 'group') => {
        return courses.reduce((acc, course) => {
            const isAssigned = Object.keys(solution).includes(course.id);
            const isTarget = type === 'teacher' ? course.teacherId === id : course.groupId === id;
            return isAssigned && isTarget ? acc + 1 : acc;
        }, 0);
    };

    const teacherHours = teachers.map(teacher => ({
        name: teacher.name,
        hours: getScheduledHours(teacher.id, 'teacher'),
    }));

    const groupHours = studentGroups.map(group => ({
        name: group.name,
        hours: getScheduledHours(group.id, 'group'),
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div>
                <h4 className="font-bold text-lg mb-2 text-brand-primary dark:text-brand-secondary">Teacher Weekly Hours</h4>
                <ul className="list-disc list-inside text-sm">
                    {teacherHours.map(t => <li key={t.name}>{t.name}: {t.hours} hours</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-bold text-lg mb-2 text-brand-primary dark:text-brand-secondary">Group Weekly Hours</h4>
                <ul className="list-disc list-inside text-sm">
                    {groupHours.map(g => <li key={g.name}>{g.name}: {g.hours} hours</li>)}
                </ul>
            </div>
        </div>
    );
};


export const TimetableDisplay: React.FC<TimetableDisplayProps> = ({ solution, courses, teachers, rooms, timeSlots, studentGroups, status, stats }) => {
    if (status === 'solving') return <Loader />;
    if (status === 'idle') return <EmptyState />;

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const days = [...new Set(timeSlots.map(ts => ts.day))].sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    const times = [...new Set(timeSlots.map(ts => ts.time))].sort();

    const getCellContent = (day: string, time: string) => {
        const timeSlot = timeSlots.find(ts => ts.day === day && ts.time === time);
        if (!timeSlot || !solution) return [];

        const scheduled = Object.entries(solution)
            .filter(([, value]) => value.timeSlotId === timeSlot.id)
            .map(([courseId, value]) => {
                const course = courses.find(c => c.id === courseId);
                const teacher = teachers.find(t => t.id === course?.teacherId);
                const room = rooms.find(r => r.id === value.roomId);
                const group = studentGroups.find(g => g.id === course?.groupId);
                return { course, teacher, room, group };
            });
        
        return scheduled;
    };
    
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 h-full overflow-auto">
            <ResultMessage success={status === 'solved'} stats={stats} />
            {solution && <SummaryStats solution={solution} courses={courses} teachers={teachers} studentGroups={studentGroups} />}

            {solution && (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="p-2 border dark:border-gray-600 w-24">Time</th>
                                {days.map(day => <th key={day} className="p-2 border dark:border-gray-600">{day}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {times.map(time => (
                                <tr key={time}>
                                    <td className="p-2 border dark:border-gray-600 font-semibold text-center">{time}</td>
                                    {days.map(day => (
                                        <td key={day} className="p-1 border dark:border-gray-600 align-top h-28">
                                            {getCellContent(day, time).map(({ course, teacher, room, group }, index) => (
                                                <div key={index} className="bg-brand-light dark:bg-brand-dark p-2 rounded-md mb-1 text-xs">
                                                    <p className="font-bold text-brand-primary dark:text-white">{course?.name}</p>
                                                    <p className="text-gray-700 dark:text-gray-300">{teacher?.name}</p>
                                                    <p className="text-gray-600 dark:text-gray-400">{room?.name} | {group?.name}</p>
                                                </div>
                                            ))}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
