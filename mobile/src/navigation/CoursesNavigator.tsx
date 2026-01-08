import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import type { CoursesStackParamList } from './types'

import CoursesListScreen from '../screens/courses/CoursesListScreen'
import CourseDetailScreen from '../screens/courses/CourseDetailScreen'
import LessonViewerScreen from '../screens/courses/LessonViewerScreen'

const Stack = createNativeStackNavigator<CoursesStackParamList>()

export function CoursesNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0A0A0B',
        },
        headerTintColor: '#FAFAFA',
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: '#0A0A0B' },
      }}>
      <Stack.Screen
        name="CoursesList"
        component={CoursesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseDetail"
        component={CourseDetailScreen}
        options={{ title: 'Curso' }}
      />
      <Stack.Screen
        name="LessonViewer"
        component={LessonViewerScreen}
        options={{ title: 'Aula' }}
      />
    </Stack.Navigator>
  )
}

export default CoursesNavigator
