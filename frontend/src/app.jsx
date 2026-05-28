/* App shell: auth context, hash router */

const { useState: useStateApp, useEffect: useEffectApp, createContext, useContext } = React;

// ---------- Auth context ----------
const AuthCtx = createContext(null);
function useAuth() { return useContext(AuthCtx); }

function AuthProvider({ children }) {
  // access token kept in memory only; user identity persisted to sessionStorage
  // so demo refresh doesn't kick you out (refresh token would normally do this server-side)
  const [user, setUser] = useStateApp(() => {
    try {
      const s = sessionStorage.getItem("signal_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [accessToken, setAccessToken] = useStateApp(null);

  function login(u) {
    setUser(u);
    setAccessToken("demo." + Math.random().toString(36).slice(2));
    try { sessionStorage.setItem("signal_user", JSON.stringify(u)); } catch {}
  }
  function logout() {
    setUser(null);
    setAccessToken(null);
    try { sessionStorage.removeItem("signal_user"); } catch {}
    window.location.hash = "#/login";
  }
  return (
    <AuthCtx.Provider value={{ user, accessToken, login, logout, isAuthed: !!user }}>
      {children}
    </AuthCtx.Provider>
  );
}

function AuthGuard({ children }) {
  const { isAuthed } = useAuth();
  useEffectApp(() => {
    if (!isAuthed) window.location.hash = "#/login";
  }, [isAuthed]);
  if (!isAuthed) return null;
  return children;
}

// ---------- Theme ----------
function useTheme() {
  const [theme, setTheme] = useStateApp(() => {
    try {
      const saved = localStorage.getItem("signal_theme");
      if (saved) return saved;
    } catch {}
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  });
  useEffectApp(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("signal_theme", theme); } catch {}
  }, [theme]);
  return [theme, setTheme];
}

// ---------- Hash router ----------
function useRoute() {
  const [route, setRoute] = useStateApp(() => parseHash(window.location.hash));
  useEffectApp(() => {
    function on() { setRoute(parseHash(window.location.hash)); }
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}
function parseHash(h) {
  const path = (h || "").replace(/^#/, "") || "/dashboard";
  // /login, /dashboard, /dashboard/opportunity/:id
  if (path === "/login") return { name: "login" };
  const m = path.match(/^\/dashboard\/opportunity\/(.+)$/);
  if (m) return { name: "detail", id: m[1] };
  return { name: "dashboard" };
}
function navigate(path) { window.location.hash = "#" + path; }

// ---------- App ----------
function App() {
  const [theme, setTheme] = useTheme();
  return (
    <AuthProvider>
      <AppRoutes theme={theme} setTheme={setTheme} />
    </AuthProvider>
  );
}

function AppRoutes({ theme, setTheme }) {
  const route = useRoute();
  const auth = useAuth();

  // If logged in and on /login, redirect
  useEffectApp(() => {
    if (auth.isAuthed && route.name === "login") {
      navigate("/dashboard");
    }
    if (!auth.isAuthed && route.name !== "login") {
      navigate("/login");
    }
  }, [auth.isAuthed, route.name]);

  if (route.name === "login") {
    return <LoginView onLogin={(u) => { auth.login(u); navigate("/dashboard"); }} />;
  }

  if (!auth.isAuthed) return null; // redirecting

  if (route.name === "detail") {
    return (
      <AuthGuard>
        <OpportunityDetail
          id={route.id}
          user={auth.user}
          onBack={() => navigate("/dashboard")}
          onLogout={auth.logout}
          theme={theme}
          setTheme={setTheme}
        />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <DashboardView
        user={auth.user}
        onLogout={auth.logout}
        theme={theme}
        setTheme={setTheme}
        onOpen={(id) => navigate(`/dashboard/opportunity/${id}`)}
      />
    </AuthGuard>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
