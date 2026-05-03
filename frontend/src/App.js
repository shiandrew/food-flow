import { Button, Layout, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import DashboardPage from "./components/DashboardPage";
import FoodList from "./components/FoodList";
import LoginForm from "./components/LoginForm";
import MyCart from "./components/MyCart";
import SignupForm from "./components/SignupForm";
import { addItemToCart, getDashboard } from "./utils";
import "./App.css";

const { Header, Content } = Layout;
const { Text, Title } = Typography;
const DASHBOARD_VIEW = "dashboard";
const BROWSE_VIEW = "browse";
const VIEW_STORAGE_KEY = "foodflow.currentView";
const RESTAURANT_STORAGE_KEY = "foodflow.selectedRestaurantId";

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [currentView, setCurrentView] = useState(DASHBOARD_VIEW);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState();
  const [dashboard, setDashboard] = useState();
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const loadDashboard = () => {
    setLoadingDashboard(true);
    return getDashboard()
      .then((data) => {
        setDashboard(data);
      })
      .catch((err) => {
        message.error(err.message);
      })
      .finally(() => {
        setLoadingDashboard(false);
      });
  };

  const handleLoginSuccess = () => {
    setAuthed(true);
    setCurrentView(window.localStorage.getItem(VIEW_STORAGE_KEY) || DASHBOARD_VIEW);
    loadDashboard();
  };

  const handleBrowseRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView(BROWSE_VIEW);
  };

  const handleAddFeaturedItem = (itemId) => {
    addItemToCart(itemId)
      .then(() => {
        message.success("Successfully add item");
        loadDashboard();
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  const handleCartUpdated = () => {
    if (authed) {
      loadDashboard();
    }
  };

  const handleGoToDashboard = () => {
    setCurrentView(DASHBOARD_VIEW);
    loadDashboard();
  };

  useEffect(() => {
    const savedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    const savedRestaurantId = window.localStorage.getItem(RESTAURANT_STORAGE_KEY);

    if (savedView === DASHBOARD_VIEW || savedView === BROWSE_VIEW) {
      setCurrentView(savedView);
    }
    if (savedRestaurantId) {
      setSelectedRestaurantId(Number(savedRestaurantId));
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedRestaurantId) {
      window.localStorage.setItem(
        RESTAURANT_STORAGE_KEY,
        String(selectedRestaurantId)
      );
    } else {
      window.localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    }
  }, [selectedRestaurantId]);

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header-row">
          <div>
            <Text className="app-brand-mark">FoodFlow</Text>
            <Title level={2} className="app-title">
              Daily Ordering Dashboard
            </Title>
          </div>
          <div className="app-header-actions">
            {authed && currentView === BROWSE_VIEW ? (
              <Button onClick={handleGoToDashboard}>
                Back to Dashboard
              </Button>
            ) : null}
            {authed && currentView === DASHBOARD_VIEW ? (
              <Button onClick={() => setCurrentView(BROWSE_VIEW)}>
                Browse Menus
              </Button>
            ) : null}
            <div>
              {authed ? <MyCart onCartUpdated={handleCartUpdated} /> : <SignupForm />}
            </div>
          </div>
        </div>
      </Header>

      <Content className="app-content">
        {authed ? (
          loadingDashboard && currentView === DASHBOARD_VIEW ? (
            <div className="app-centered-state">
              <Spin size="large" />
            </div>
          ) : currentView === DASHBOARD_VIEW ? (
            <DashboardPage
              dashboard={dashboard}
              onBrowseAll={() => setCurrentView(BROWSE_VIEW)}
              onBrowseRestaurant={handleBrowseRestaurant}
              onAddItemToCart={handleAddFeaturedItem}
            />
          ) : (
            <div className="browse-page">
              <Title level={3}>Browse Restaurants</Title>
              <FoodList
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantChange={setSelectedRestaurantId}
                onCartUpdated={handleCartUpdated}
              />
            </div>
          )
        ) : (
          <div className="app-centered-state">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default App;
