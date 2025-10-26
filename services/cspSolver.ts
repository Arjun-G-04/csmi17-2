import { Course, Room, TimeSlot, Teacher, StudentGroup, Assignment, Domain, SolverResult } from '../types';

let nodesVisited = 0;

function isConsistent(
  courseId: string,
  assignmentValue: { roomId: string, timeSlotId: string },
  assignment: Assignment,
  courses: Course[],
  teachers: Teacher[],
  studentGroups: StudentGroup[],
): boolean {
  const currentCourse = courses.find(c => c.id === courseId)!;

  // Contraint 1: Teacher availability
  const teacher = teachers.find(t => t.id === currentCourse.teacherId)!;
  if (teacher.unavailableTimeSlots?.includes(assignmentValue.timeSlotId)) {
      return false;
  }
  
  // Contraint 2: Group availability
  const group = studentGroups.find(g => g.id === currentCourse.groupId)!;
  if (group.unavailableTimeSlots?.includes(assignmentValue.timeSlotId)) {
      return false;
  }

  for (const assignedCourseId in assignment) {
    if (assignedCourseId === courseId) continue;

    const assignedValue = assignment[assignedCourseId];
    const otherCourse = courses.find(c => c.id === assignedCourseId)!;

    // Constraint 3: Same room at the same time
    if (assignedValue.roomId === assignmentValue.roomId && assignedValue.timeSlotId === assignmentValue.timeSlotId) {
      return false;
    }

    // Constraint 4: Same teacher at the same time
    if (otherCourse.teacherId === currentCourse.teacherId && assignedValue.timeSlotId === assignmentValue.timeSlotId) {
      return false;
    }

    // Constraint 5: Same student group at the same time
    if (otherCourse.groupId === currentCourse.groupId && assignedValue.timeSlotId === assignmentValue.timeSlotId) {
      return false;
    }
  }

  return true;
}

// Finding the course with highest constrains i.e. lowest options
function selectUnassignedVariable_MRV(courses: Course[], assignment: Assignment, domain: Domain): string {
  let minRemainingValues = Infinity;
  let result: string | null = null;

  for (const course of courses) {
    if (!(course.id in assignment)) {
      const remainingValues = domain[course.id].length;
      if (remainingValues < minRemainingValues) {
        minRemainingValues = remainingValues;
        result = course.id;
      }
    }
  }
  return result!;
}


function backtrackingSearchWithHeuristics(
  assignment: Assignment,
  courses: Course[],
  domain: Domain,
  teachers: Teacher[],
  studentGroups: StudentGroup[],
  rooms: Room[]
): Assignment | null {
  nodesVisited++;
  if (Object.keys(assignment).length === courses.length) {
    return assignment;
  }

  const courseId = selectUnassignedVariable_MRV(courses, assignment, domain);
  
  // LCV would be complex to implement fully here, so we use a simple domain iteration
  for (const value of domain[courseId]) {
    if (isConsistent(courseId, value, assignment, courses, teachers, studentGroups)) {
      const newAssignment = { ...assignment, [courseId]: value };
      const result = backtrackingSearchWithHeuristics(newAssignment, courses, domain, teachers, studentGroups, rooms);
      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}

// Checking wether applied assignment gives valid domain in next step
function forwardCheck(
  courseId: string,
  value: { roomId: string; timeSlotId: string },
  assignment: Assignment,
  domain: Domain,
  courses: Course[]
): Domain | null {
  const newDomain = JSON.parse(JSON.stringify(domain)); // Deep copy

  const currentCourse = courses.find(c => c.id === courseId)!;

  for (const otherCourse of courses) {
      if (!(otherCourse.id in assignment) && otherCourse.id !== courseId) {
          const toRemove = [];
          for (const otherValue of newDomain[otherCourse.id]) {
              if (
                  (otherValue.roomId === value.roomId && otherValue.timeSlotId === value.timeSlotId) ||
                  (otherCourse.teacherId === currentCourse.teacherId && otherValue.timeSlotId === value.timeSlotId) ||
                  (otherCourse.groupId === currentCourse.groupId && otherValue.timeSlotId === value.timeSlotId)
              ) {
                  toRemove.push(otherValue);
              }
          }

          newDomain[otherCourse.id] = newDomain[otherCourse.id].filter(
            (val: {roomId: string, timeSlotId: string}) => !toRemove.some(rem => rem.roomId === val.roomId && rem.timeSlotId === val.timeSlotId)
          );

          if (newDomain[otherCourse.id].length === 0) {
              return null;
          }
      }
  }

  return newDomain;
}

function backtrackingSearchWithForwardChecking(
  assignment: Assignment,
  courses: Course[],
  domain: Domain,
  teachers: Teacher[],
  studentGroups: StudentGroup[],
  rooms: Room[]
): Assignment | null {
    nodesVisited++;
    if (Object.keys(assignment).length === courses.length) {
        return assignment;
    }

    const courseId = selectUnassignedVariable_MRV(courses, assignment, domain);

    for (const value of domain[courseId]) {
        if (isConsistent(courseId, value, assignment, courses, teachers, studentGroups, rooms)) {
            const newAssignment = { ...assignment, [courseId]: value };
            
            const newDomain = forwardCheck(courseId, value, newAssignment, domain, courses);

            if (newDomain !== null) {
                const result = backtrackingSearchWithForwardChecking(newAssignment, courses, newDomain, teachers, studentGroups, rooms);
                if (result !== null) {
                    return result;
                }
            }
        }
    }

    return null;
}


export function solve(
  algorithm: 'BACKTRACKING_HEURISTICS' | 'FORWARD_CHECKING',
  courses: Course[],
  teachers: Teacher[],
  rooms: Room[],
  timeSlots: TimeSlot[],
  studentGroups: StudentGroup[]
): SolverResult {
  const startTime = performance.now();
  nodesVisited = 0;

  const expandedCourses: Course[] = [];
  for (const course of courses) {
    for (let i = 1; i <= course.hours; i++) {
        expandedCourses.push({
            ...course,
            id: `${course.id}_${i}`,
            name: course.hours > 1 ? `${course.name} (${i}/${course.hours})` : course.name,
        });
    }
  }

  const initialDomain: Domain = {};
  const allPossibleAssignments = rooms.flatMap(room => timeSlots.map(timeSlot => ({ roomId: room.id, timeSlotId: timeSlot.id })));
  
  for (const course of expandedCourses) {
    const teacher = teachers.find(t => t.id === course.teacherId);
    const group = studentGroups.find(g => g.id === course.groupId);

    if (!teacher || !group) {
        initialDomain[course.id] = [];
        continue;
    }

    initialDomain[course.id] = allPossibleAssignments.filter(val => {
        const teacherIsAvailable = !teacher.unavailableTimeSlots?.includes(val.timeSlotId);
        const groupIsAvailable = !group.unavailableTimeSlots?.includes(val.timeSlotId);
        return teacherIsAvailable && groupIsAvailable;
    });
  }


  let solution: Assignment | null = null;
  const initialAssignment: Assignment = {};

  if (algorithm === 'BACKTRACKING_HEURISTICS') {
    solution = backtrackingSearchWithHeuristics(initialAssignment, expandedCourses, initialDomain, teachers, studentGroups, rooms);
  } else if (algorithm === 'FORWARD_CHECKING') {
    solution = backtrackingSearchWithForwardChecking(initialAssignment, expandedCourses, initialDomain, teachers, studentGroups, rooms);
  }

  const endTime = performance.now();
  
  return {
    solution,
    stats: {
      timeTaken: endTime - startTime,
      nodesVisited: nodesVisited,
    },
    expandedCourses: solution ? expandedCourses : courses,
  };
}