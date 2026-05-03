import {
  ArrowRightOutlined,
  InboxOutlined,
  FireOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Empty, List, Row, Space, Statistic, Typography } from "antd";

const { Paragraph, Text, Title } = Typography;

const DashboardPage = ({ dashboard, onBrowseRestaurant, onBrowseAll, onAddItemToCart }) => {
  const firstName = dashboard?.first_name?.trim();
  const heading = firstName ? `Welcome back, ${firstName}` : "Welcome back";

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <Text className="dashboard-eyebrow">FoodFlow Dashboard</Text>
          <Title level={2} className="dashboard-title">
            {heading}
          </Title>
          <Paragraph className="dashboard-copy">
            Pick up where you left off with a quick cart snapshot, restaurant shortcuts,
            and a few standout dishes ready to add.
          </Paragraph>
          <Space wrap>
            <Button type="primary" size="large" onClick={onBrowseAll}>
              Browse Restaurants
            </Button>
          </Space>
        </div>
        <Card className="dashboard-highlight" bordered={false}>
          <Statistic
            title="Current cart total"
            prefix="$"
            value={dashboard?.cart_summary?.total_price ?? 0}
            precision={2}
          />
          <Text type="secondary">
            {dashboard?.cart_summary?.item_count ?? 0} items waiting in your cart
          </Text>
        </Card>
      </section>

      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} md={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <Statistic
              title="Cart Items"
              value={dashboard?.cart_summary?.item_count ?? 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <Statistic
              title="Restaurants"
              value={dashboard?.restaurant_count ?? 0}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="dashboard-stat-card">
            <Statistic
              title="Featured Picks"
              value={dashboard?.featured_items?.length ?? 0}
              prefix={<FireOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Card
            className="dashboard-section-card"
            bordered={false}
            title="Restaurant Quick Access"
            extra={
              <Button type="link" onClick={onBrowseAll}>
                Browse all
              </Button>
            }
          >
            <List
              dataSource={dashboard?.restaurants ?? []}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No restaurants are available right now."
                  />
                ),
              }}
              renderItem={(restaurant) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => onBrowseRestaurant(restaurant.id)}
                    >
                      Open menu
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <img
                        alt={restaurant.name}
                        className="dashboard-restaurant-image"
                        src={restaurant.image_url}
                      />
                    }
                    title={restaurant.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{restaurant.address}</Text>
                        <Text type="secondary">
                          {restaurant.menu_count} menu items
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            className="dashboard-section-card"
            bordered={false}
            title="Featured Items"
          >
            <List
              dataSource={dashboard?.featured_items ?? []}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No featured items yet."
                  />
                ),
              }}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => onAddItemToCart(item.id)}>
                      Add to cart
                    </Button>,
                    <Button
                      type="link"
                      onClick={() => onBrowseRestaurant(item.restaurant_id)}
                    >
                      View menu <ArrowRightOutlined />
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <img
                        alt={item.name}
                        className="dashboard-featured-image"
                        src={item.image_url}
                      />
                    }
                    title={item.name}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{item.restaurant_name}</Text>
                        <Text type="secondary">${item.price?.toFixed(2)}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            {!(dashboard?.featured_items?.length ?? 0) ? (
              <Space className="dashboard-empty-hint">
                <InboxOutlined />
                <Text type="secondary">
                  Featured picks will appear here after menu content is loaded.
                </Text>
              </Space>
            ) : null}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
