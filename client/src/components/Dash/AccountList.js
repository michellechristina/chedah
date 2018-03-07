import React, {Component} from "react";
// import {Badge, Chip} from 'react-materialize';
import Account from './Account';


// materialize account list
class AccountList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            collapsed: false
        }

        console.log(`-> AccountList: `, props);
    }

    handleClick() {
        this.setState({collapsed: !this.state.collapsed})
    }

    render() {
        const arrowName = (this.state.collapsed === false) ? 'arrow_drop_down' : 'arrow_drop_up';
        return (
            <ul className="account-summary collapsible collection with-header" datacollapsible="expandable">
                <li>
                    {/* Header */}
                    <div className="collapsible-header listHeader" onClick={this.handleClick.bind(this)}>
                        <h6><i className="material-icons iconStyleSmall">account_balance</i> Accounts</h6>
                        <i className="header-expand-state material-icons">{arrowName}</i>
                    </div>

                    {/* Body insert_chart */}
                    {this.props.accounts.map((account, i) => (
                        <Account key={i} {...account} />
                    ))}
                </li>
            </ul>
        );
    }
}

export default AccountList;
