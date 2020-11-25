import React, { Component } from 'react'
import { Link } from 'react-router-dom';

import AppBar from '../../../../../wix-oauth-app-stores-example/wix-oauth-app-stores/client/src/components/node_modules/@material-ui/core/AppBar';
import Toolbar from '../../../../../wix-oauth-app-stores-example/wix-oauth-app-stores/client/src/components/node_modules/@material-ui/core/Toolbar';

import Typography from '../../../../../wix-oauth-app-stores-example/wix-oauth-app-stores/client/src/components/node_modules/@material-ui/core/Typography';

export class NavBar extends Component {
    render() {
        return (
            <AppBar>
                <Toolbar className="nav-container">
                    <Typography component="h1" variant="h5">
                        Wix Oauth App
                    </Typography>
                </Toolbar>
            </AppBar>
        )
    }
}

export default NavBar
