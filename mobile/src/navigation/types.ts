import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps } from '@react-navigation/native'

// Tipos das rotas de autenticação
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

// Tipos das rotas principais (tabs)
export type MainTabParamList = {
  Dashboard: undefined
  Courses: undefined
  Profile: undefined
}

// Tipos das rotas de cursos
export type CoursesStackParamList = {
  CoursesList: undefined
  CourseDetail: { courseId: string }
  LessonViewer: { courseId: string; lessonId: string }
}

// Tipos das rotas raiz
export type RootStackParamList = {
  Auth: undefined
  Main: undefined
}

// Props para telas de autenticação
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>

// Props para telas principais (tabs)
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >

// Props para telas de cursos
export type CoursesScreenProps<T extends keyof CoursesStackParamList> =
  NativeStackScreenProps<CoursesStackParamList, T>
