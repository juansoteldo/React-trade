import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Tab, Spinner } from "react-bootstrap";
import Tabs from "react-bootstrap/Tabs";
import List from "../../components/list";
import Filters from "../../components/filters";
import APIConfig from "../../helpers/api/config";
import axios from "axios";
import HandleAPIData from "../../helpers/handleAPIData";
import moment from "moment";
class LiveAcution extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      key: "view-auction",
      liveAuction: [],
      showData: true,
      loading: false,
      appild: [],
      filters: {},
      start: 0,
      total: 0,
    };
  }
  handleDateFilter = (data) => {
    var tempArray = [];
    data.forEach((element) => {
      var given = moment(element.created_at, "YYYY-MM-DD");
      var current = moment().startOf("day");
      if (moment.duration(given.diff(current)).asDays() > -2) {
        tempArray.push(element);
      }
    });
    return tempArray;
  };
  getData = async () => {
    this._isMounted = true;
    this.setState({ loading: true });
    try {
      const { filters, start: startState, appild } = this.state;
      const make = filters.car_make ? `&make=${filters.car_make}` : "";
      const model = filters.car_model ? `&model=${filters.car_model}` : "";

      const response = await axios(
        APIConfig(
          "get",
          `/list_auction_dealer?start=${startState}${make}${model}`,
          null
        )
      );
      if (response.status === 200) {
        const { auctions, start, total } = response.data;

        this.setState({
          loading: false,
          start,
          total,
          appild: [...appild, ...HandleAPIData(auctions)],
        });
      }
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  };
  handleFilters = (filters) => {
    this.setState({ showData: true, filters }, function () {
      this.getData();
    });
  };
  handleResetFilter = () => {
    this.setState({ showData: false, filters: {} }, function () {
      this.getData();
    });
  };
  handleLoadMore() {
    this.getData();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  componentDidMount() {
    this.getData();
  }
  render() {
    const { loading, key, appild, start, total } = this.state;

    return (
      <div className="w-100">
        <Card className="tabs-card">
          <Card.Header>
            <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => this.setState({ key: k })}
              className="mb-3 main-content-tabs"
            >
              <Tab
                eventKey="view-auction"
                title="View Auction "
                className="auction-text"
              >
                <Filters
                  handleResetFilter={this.handleResetFilter}
                  handleFilters={this.handleFilters}
                />

                {!loading ? (
                  <List
                    {...this.props}
                    listData={appild}
                    loadMore={total > start}
                    handleLoadMore={this.handleLoadMore.bind(this)}
                  />
                ) : (
                  <div className="d-flex justify-content-center align-items-center loading-container">
                    <Spinner animation="grow" variant="light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Card.Header>
        </Card>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    vouched: state.app.vouched,
  };
};
const mapDispatchToProps = () => {
  return {};
};
export default connect(mapStateToProps, mapDispatchToProps)(LiveAcution);
