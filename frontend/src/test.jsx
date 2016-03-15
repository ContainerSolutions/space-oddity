var React = require('react');
var Slider = require('react-rangeslider');

var Volume = React.createClass({
    getInitialState: function(){
        return {
            value: 10,
        };
    },

    handleChange: function(value) {
        this.setState({
            value: value,
        });
    },

    render: function() {
        return (
            <Slider
        value={this.state.value}
        orientation="vertical"
        onChange={this.handleChange} />
        );
    }
});

module.exports = Volume;