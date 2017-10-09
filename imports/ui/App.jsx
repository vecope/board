import React, {Component} from "react";
import PropTypes from "prop-types";
import {createContainer} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor"

import InputPlayer from "./InputPlayer.jsx";
import Board from "./Board.jsx";
import Controls from "./Controls.jsx";

import {Players} from "../api/players.js";
import AccountsUIWrapper from "./AccountUIWrapper";

class App extends Component {

    constructor(props) {
        super(props);

        this.width = 600;
        this.height = 600;
        this.state = {
            players: [{
                name: "John",
                x: 300,
                y: 300
            }]
        }

        this.onEnterPlayer = this.onEnterPlayer.bind(this);
        this.movePlayer = this.movePlayer.bind(this);
    }

    onEnterPlayer(name) {

        let player = Players.findOne({name: name});
        if (player === undefined) {
            player = {
                name: name,
                x: Math.random() * this.width,
                y: Math.random() * this.height
            };

            player._id = Players.insert(player);

        }

        this.setState({
            currentPlayer: player
        });
        this.forceUpdate();
    }

    movePlayer(direction) {

        let player = Players.findOne(this.state.currentPlayer._id),
            x = player.x,
            y = player.y;
        switch (direction) {
            case "up":
                y -= 1;
                break;
            case "down":
                y += 1;
                break;
            case "left":
                x -= 1;
                break;
            case "right":
                x += 1;
                break
        }

        Players.update(this.state.currentPlayer._id,
            {
                name: player.name,
                x: x,
                y: y
            }
        );
    }

    componentWillUpdate() {
        if (Meteor.user()) {
            if (this.state.currentPlayer &&
                Meteor.user().username === this.state.currentPlayer.name)
                return;
            this.onEnterPlayer(Meteor.user().username);
        }
    }

    render() {
        return (
            <div className="App">

                <div>
                    <AccountsUIWrapper/>
                </div>
                {Meteor.user() !== null ?
                    <Controls onClick={this.movePlayer}/> :
                    <div> Please sign in </div>
                    // <InputPlayer onClick={this.onEnterPlayer}/>
                }
                <Board width={this.width}
                       height={this.height}
                       players={this.props.players}/>
            </div>
        );
    }
}

App.propTypes = {
    players: PropTypes.array.isRequired,
    user: PropTypes.object
};

export default createContainer(() => {
    return {
        players: Players.find({}).fetch(),
        user: Meteor.user()
    };
}, App);
