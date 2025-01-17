import React, { cloneElement } from 'react';
import BootstrapMixin from './BootstrapMixin';

import ValidComponentChildren from './utils/ValidComponentChildren';
import Nav from './Nav';
import NavItem from './NavItem';
import DropdownButton from './DropdownButton';
import MenuItem from './MenuItem';

let panelId = (props, child) => child.props.id ? child.props.id : props.id && (props.id + '___panel___' + child.props.eventKey);
let tabId = (props, child) => child.props.id ? child.props.id + '___tab' : props.id && (props.id + '___tab___' + child.props.eventKey);

function getDefaultActiveKeyFromChildren(children) {
  let defaultActiveKey;

  ValidComponentChildren.forEach(children, function(child) {
    if (defaultActiveKey == null) {
      defaultActiveKey = child.props.eventKey;
    }
  });

  return defaultActiveKey;
}

const TabbedArea = React.createClass({
  mixins: [BootstrapMixin],

  propTypes: {
    activeKey: React.PropTypes.any,
    defaultActiveKey: React.PropTypes.any,
    bsStyle: React.PropTypes.oneOf(['tabs', 'pills']),
    animation: React.PropTypes.bool,
    id: React.PropTypes.string,
    onSelect: React.PropTypes.func
  },

  getDefaultProps() {
    return {
      bsStyle: 'tabs',
      animation: true
    };
  },

  getInitialState() {
    let defaultActiveKey = this.props.defaultActiveKey != null ?
      this.props.defaultActiveKey : getDefaultActiveKeyFromChildren(this.props.children);

    return {
      activeKey: defaultActiveKey,
      previousActiveKey: null
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeKey != null && nextProps.activeKey !== this.props.activeKey) {
      this.setState({
        previousActiveKey: this.props.activeKey
      });
    }
  },

  handlePaneAnimateOutEnd() {
    this.setState({
      previousActiveKey: null
    });
  },

  render() {
    let { id, ...props } = this.props;

    let activeKey =
      this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;

    function renderTabIfSet(child) {
      return child.props.tab != null ? this.renderTab(child) : null;
    }

    let nav = (
      <Nav {...props} activeKey={activeKey} onSelect={this.handleSelect} ref="tabs">
        {ValidComponentChildren.map(this.props.children, renderTabIfSet, this)}
      </Nav>
    );

    return (
      <div>
        {nav}
        <div id={id} className="tab-content" ref="panes">
          {ValidComponentChildren.map(this.props.children, this.renderPane)}
        </div>
      </div>
    );
  },

  getActiveKey() {
    return this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;
  },

  renderPane(child, index) {
    let activeKey = this.getActiveKey();

    if (child.props.onClick) {

      return null;

    } else if (child.props.navItem) {

      return ValidComponentChildren.map(child.props.children, this.renderPane);

    } else {

      let active = (child.props.eventKey === activeKey &&
            (this.state.previousActiveKey == null || !this.props.animation));
      return cloneElement(
        child,
        {
          active,
          id: panelId(this.props, child),
          'aria-labelledby': tabId(this.props, child),
          key: child.key ? child.key : index,
          animation: this.props.animation,
          onAnimateOutEnd: (this.state.previousActiveKey != null &&
            child.props.eventKey === this.state.previousActiveKey) ? this.handlePaneAnimateOutEnd : null
        }
      );
    }
  },

  renderMenu(child) {
    let {eventKey, className, tab, disabled, onClick} = child.props;
    if (onClick) {
      return (
        <MenuItem
          ref={'tab' + eventKey}
          eventKey={eventKey}
          className={className}
          disabled={disabled}
          onClick={onClick}>
          {tab}
        </MenuItem>
      );
    }
    else {
      return (
        <MenuItem
          ref={'tab' + eventKey}
          eventKey={eventKey}
          className={className}
          disabled={disabled}>
          {tab}
        </MenuItem>
      );
    }
  },

  renderTab(child) {
    let {eventKey, className, tab, disabled, navItem} = child.props;
    if (navItem) {
      return (
        <DropdownButton
          ref={'tab' + eventKey}
          eventKey={eventKey}
          className={className}
          disabled={disabled}
          title={tab}
          navItem={navItem}>
          {ValidComponentChildren.map(child.props.children, this.renderMenu)}
        </DropdownButton>
      );
    } else {
      return (
        <NavItem
          linkId={tabId(this.props, child)}
          ref={'tab' + eventKey}
          aria-controls={panelId(this.props, child)}
          eventKey={eventKey}
          className={className}
          disabled={disabled}>
          {tab}
        </NavItem>
      );
    }
  },

  shouldComponentUpdate() {
    // Defer any updates to this component during the `onSelect` handler.
    return !this._isChanging;
  },

  handleSelect(key) {
    if (this.props.onSelect) {
      this._isChanging = true;
      this.props.onSelect(key);
      this._isChanging = false;
    } else if (key !== this.getActiveKey()) {
      this.setState({
        activeKey: key,
        previousActiveKey: this.getActiveKey()
      });
    }
  }
});

export default TabbedArea;
