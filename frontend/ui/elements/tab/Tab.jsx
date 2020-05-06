import { React, elements } from 'perun-core';

const RBTab = elements.ReactBootstrap.Tab;

export const Tab = (props) => 
    <elements.ReactBootstrap.Tab {...props} />;

Tab.Container = RBTab.TabContainer;
Tab.Content = RBTab.TabContent;
Tab.Pane = RBTab.TabPane;