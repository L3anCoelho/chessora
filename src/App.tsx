import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingState } from '@/components/ui/Feedback';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/features/authentication/AuthProvider';
import { RequireAdmin, RequireAuth } from '@/features/authentication/guards';
import { ProgressProvider } from '@/features/progress/ProgressProvider';
import { MainLayout } from '@/layouts/MainLayout';
import { RouteErrorPage } from '@/pages/RouteErrorPage';

const HomePage = lazy(() => import('@/pages/HomePage'));
const PlayPage = lazy(() => import('@/pages/PlayPage'));
const LearnPage = lazy(() => import('@/pages/LearnPage'));
const ModulePage = lazy(() => import('@/pages/ModulePage'));
const LessonPage = lazy(() => import('@/pages/LessonPage'));
const ChallengesPage = lazy(() => import('@/pages/ChallengesPage'));
const ChallengePage = lazy(() => import('@/pages/ChallengePage'));
const EbookPage = lazy(() => import('@/pages/EbookPage'));
const CheckoutReturnPage = lazy(() => import('@/pages/CheckoutReturnPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout').then((module) => ({ default: module.AdminLayout })));
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/AdminContentPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminEbookPage = lazy(() => import('@/pages/admin/AdminEbookPage'));

function Page({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingState />}>{children}</Suspense>;
}

const router = createBrowserRouter(
  [
    {
      element: <MainLayout />,
      errorElement: <RouteErrorPage />,
      children: [
        { index: true, element: <Page><HomePage /></Page> },
        { path: 'jogar', element: <Page><PlayPage /></Page> },
        { path: 'aprender', element: <Page><LearnPage /></Page> },
        { path: 'aprender/:moduleSlug', element: <Page><ModulePage /></Page> },
        { path: 'aprender/:moduleSlug/:lessonSlug', element: <Page><LessonPage /></Page> },
        { path: 'desafios', element: <Page><ChallengesPage /></Page> },
        { path: 'desafios/:challengeId', element: <Page><ChallengePage /></Page> },
        { path: 'ebook', element: <Page><EbookPage /></Page> },
        { path: 'ebook/obrigado', element: <Page><CheckoutReturnPage /></Page> },
        { path: 'progresso', element: <Page><ProgressPage /></Page> },
        { path: 'entrar', element: <Page><LoginPage /></Page> },
        { path: 'cadastro', element: <Page><RegisterPage /></Page> },
        { path: 'recuperar-senha', element: <Page><ForgotPasswordPage /></Page> },
        { path: 'redefinir-senha', element: <Page><ResetPasswordPage /></Page> },
        { path: 'perfil', element: <Page><RequireAuth><ProfilePage /></RequireAuth></Page> },
        { path: 'configuracoes', element: <Page><SettingsPage /></Page> },
        { path: 'acesso-negado', element: <Page><UnauthorizedPage /></Page> },
        { path: '*', element: <Page><NotFoundPage /></Page> },
      ],
    },
    {
      path: 'admin',
      errorElement: <RouteErrorPage />,
      element: (
        <Page>
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        </Page>
      ),
      children: [
        { index: true, element: <Page><AdminOverviewPage /></Page> },
        { path: 'conteudo', element: <Page><AdminContentPage /></Page> },
        { path: 'usuarios', element: <Page><AdminUsersPage /></Page> },
        { path: 'ebook', element: <Page><AdminEbookPage /></Page> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined },
);

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProgressProvider>
          <RouterProvider router={router} />
        </ProgressProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
