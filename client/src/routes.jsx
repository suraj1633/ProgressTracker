import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Tips from "./pages/Tips";
import TopicPage from "./pages/TopicPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        <Route
          path="/tips"
          element={<Tips />}
        />

        <Route
          path="/topic/:id"
          element={<TopicPage />}
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
