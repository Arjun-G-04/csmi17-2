import React from 'react';
import { Course, Teacher, Room, StudentGroup, TimeSlot } from '../types';

interface InputFormProps {
    courses: Course[];
    setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
    teachers: Teacher[];
    setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
    rooms: Room[];
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
    studentGroups: StudentGroup[];
    setStudentGroups: React.Dispatch<React.SetStateAction<StudentGroup[]>>;
    timeSlots: TimeSlot[];
    setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
        <h3 className="text-xl font-bold mb-3 text-brand-primary dark:text-brand-secondary">{title}</h3>
        {children}
    </div>
);

const AddButton: React.FC<{ onClick: () => void, text?: string }> = ({ onClick, text = "Add New" }) => (
    <button onClick={onClick} className="w-full mt-2 bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-md transition-colors duration-200">
        {text}
    </button>
);

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const InputForm: React.FC<InputFormProps> = ({ courses, setCourses, teachers, setTeachers, rooms, setRooms, studentGroups, setStudentGroups, timeSlots, setTimeSlots }) => {

    const addCourse = () => setCourses([...courses, { id: `c${courses.length + 1}`, name: '', teacherId: teachers[0]?.id || '', groupId: studentGroups[0]?.id || '', hours: 1 }]);
    const addTeacher = () => setTeachers([...teachers, { id: `t${teachers.length + 1}`, name: '', unavailableTimeSlots: [] }]);
    const addRoom = () => setRooms([...rooms, { id: `r${rooms.length + 1}`, name: '', capacity: 30 }]);
    const addGroup = () => setStudentGroups([...studentGroups, { id: `g${studentGroups.length + 1}`, name: '', size: 30, unavailableTimeSlots: [] }]);
    const addTimeSlot = () => setTimeSlots([...timeSlots, { id: `ts${Date.now()}`, day: 'Monday', time: '13:00-14:00' }]);
    
    const handleGenericChange = <T,>(index: number, field: keyof T, value: any, items: T[], setItems: React.Dispatch<React.SetStateAction<T[]>>) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleMultiSelectChange = (options: HTMLOptionsCollection) => {
        return Array.from(options).filter(o => o.selected).map(o => o.value);
    };

    return (
        <div className="p-4 overflow-y-auto h-full">
             <Section title="Time Slots">
                {timeSlots.map((ts, i) => (
                    <div key={ts.id} className="grid grid-cols-3 gap-2 mb-2">
                        <select
                            value={ts.day}
                            onChange={e => handleGenericChange(i, 'day', e.target.value, timeSlots, setTimeSlots)}
                            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                        >
                            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <input type="text" value={ts.time} onChange={e => handleGenericChange(i, 'time', e.target.value, timeSlots, setTimeSlots)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="e.g. 9:00-10:00" />
                        <button onClick={() => setTimeSlots(timeSlots.filter((_, idx) => idx !== i))} className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-2 rounded">Remove</button>
                    </div>
                ))}
                <AddButton onClick={addTimeSlot} text="Add Time Slot" />
            </Section>

            <Section title="Teachers">
                {teachers.map((teacher, i) => (
                    <div key={teacher.id} className="mb-4 p-2 border-b dark:border-gray-700">
                        <input type="text" value={teacher.name} onChange={(e) => handleGenericChange(i, 'name', e.target.value, teachers, setTeachers)} className="w-full p-2 mb-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder={`Teacher ${i+1} Name`} />
                        <label className="text-sm text-gray-600 dark:text-gray-400">Unavailable Times (Ctrl+Click to select multiple)</label>
                        <select multiple value={teacher.unavailableTimeSlots} onChange={e => handleGenericChange(i, 'unavailableTimeSlots', handleMultiSelectChange(e.target.options), teachers, setTeachers)} className="w-full h-24 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            {timeSlots.map(ts => <option key={ts.id} value={ts.id}>{ts.day} {ts.time}</option>)}
                        </select>
                    </div>
                ))}
                <AddButton onClick={addTeacher} text="Add Teacher"/>
            </Section>

            <Section title="Student Groups">
                {studentGroups.map((group, i) => (
                    <div key={group.id} className="mb-4 p-2 border-b dark:border-gray-700">
                        <input type="text" value={group.name} onChange={(e) => handleGenericChange(i, 'name', e.target.value, studentGroups, setStudentGroups)} className="w-full p-2 mb-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder={`Group ${i+1} Name`} />
                        <label className="text-sm text-gray-600 dark:text-gray-400">Unavailable Times (Ctrl+Click to select multiple)</label>
                        <select multiple value={group.unavailableTimeSlots} onChange={e => handleGenericChange(i, 'unavailableTimeSlots', handleMultiSelectChange(e.target.options), studentGroups, setStudentGroups)} className="w-full h-24 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            {timeSlots.map(ts => <option key={ts.id} value={ts.id}>{ts.day} {ts.time}</option>)}
                        </select>
                    </div>
                ))}
                <AddButton onClick={addGroup} text="Add Group" />
            </Section>

            <Section title="Rooms">
                {rooms.map((room, i) => (
                    <input key={room.id} type="text" value={room.name} onChange={(e) => handleGenericChange(i, 'name', e.target.value, rooms, setRooms)} className="w-full p-2 mb-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder={`Room ${i+1} Name`} />
                ))}
                <AddButton onClick={addRoom} text="Add Room" />
            </Section>

            <Section title="Courses">
                {courses.map((course, i) => (
                    <div key={course.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 border rounded-md dark:border-gray-600">
                        <input type="text" value={course.name} onChange={e => handleGenericChange(i, 'name', e.target.value, courses, setCourses)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 col-span-4 md:col-span-1" placeholder="Course Name" />
                        <select value={course.teacherId} onChange={e => handleGenericChange(i, 'teacherId', e.target.value, courses, setCourses)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                           {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                         <select value={course.groupId} onChange={e => handleGenericChange(i, 'groupId', e.target.value, courses, setCourses)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                           {studentGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                        <input type="number" value={course.hours} min="1" onChange={e => handleGenericChange(i, 'hours', parseInt(e.target.value, 10) || 1, courses, setCourses)} className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" placeholder="Weekly Hours" />
                    </div>
                ))}
                <AddButton onClick={addCourse} text="Add Course" />
            </Section>
        </div>
    );
};