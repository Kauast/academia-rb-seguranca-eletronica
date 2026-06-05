import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TrailPage from "./pages/TrailPage";
import LessonPage from "./pages/LessonPage";
import QuizPage from "./pages/QuizPage";
import ProfilePage from "./pages/ProfilePage";
import CertificatePage from "./pages/CertificatePage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminTrails from "./pages/admin/AdminTrails";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminUsers from "./pages/admin/AdminUsers";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/trilha/:slug" component={TrailPage} />
      <Route path="/aula/:lessonId" component={LessonPage} />
      <Route path="/quiz/:trailId" component={QuizPage} />
      <Route path="/perfil" component={ProfilePage} />
      <Route path="/certificado/:code" component={CertificatePage} />
      <Route path="/admin/:rest*">
        {() => (
          <AdminLayout>
            <Switch>
              <Route path="/admin" component={AdminTrails} />
              <Route path="/admin/trilhas" component={AdminTrails} />
              <Route path="/admin/cursos" component={AdminCourses} />
              <Route path="/admin/aulas" component={AdminLessons} />
              <Route path="/admin/questoes" component={AdminQuestions} />
              <Route path="/admin/alunos" component={AdminUsers} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        )}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
