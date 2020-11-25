import React, { Component } from 'react'
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Typography from '@material-ui/core/Typography';

export class NavBar extends Component {
    render() {
        return (
            <AppBar>
                <Toolbar className="nav-container">
                    <Typography component="h1" variant="h5">
                        Wix MailChimp App
                    </Typography>
                </Toolbar>
            </AppBar>
        )
    }
}

export default NavBar
