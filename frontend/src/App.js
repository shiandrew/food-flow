import { Button, Layout, Spin, Typography, message } from "antd";
import { useState } from "react";
import DashboardPage from "./components/DashboardPage";
import FoodList from "./components/FoodList";
import LoginForm from "./components/LoginForm";
import MyCart from "./components/MyCart";
import SignupForm from "./components/SignupForm";
import { addItemToCart, getDashboard } from "./utils";
import "./App.css";

const { Header, Content } = Layout;
const { Text, Title } = Typography;

const App = () => {
  const [authed, setAuthed] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
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
    setCurrentView("dashboard");
    loadDashboard();
  };

  const handleBrowseRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView("browse");
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
            {authed && currentView === "browse" ? (
              <Button onClick={() => setCurrentView("dashboard")}>
                Back to Dashboard
              </Button>
            ) : null}
            {authed && currentView === "dashboard" ? (
              <Button onClick={() => setCurrentView("browse")}>
                Browse Menus
              </Button>
            ) : null}
            <div>{authed ? <MyCart /> : <SignupForm />}</div>
          </div>
        </div>
      </Header>

      <Content className="app-content">
        {authed ? (
          loadingDashboard && currentView === "dashboard" ? (
            <div className="app-centered-state">
              <Spin size="large" />
            </div>
          ) : currentView === "dashboard" ? (
            <DashboardPage
              dashboard={dashboard}
              onBrowseAll={() => setCurrentView("browse")}
              onBrowseRestaurant={handleBrowseRestaurant}
              onAddItemToCart={handleAddFeaturedItem}
            />
          ) : (
            <div className="browse-page">
              <Title level={3}>Browse Restaurants</Title>
              <FoodList
                selectedRestaurantId={selectedRestaurantId}
                onRestaurantChange={setSelectedRestaurantId}
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
