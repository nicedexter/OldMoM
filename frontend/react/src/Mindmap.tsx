import * as React from "react";

import "./App.css";
import Graph from "./Graph";

class Mindmap extends React.Component {
  public state = {
    inputValue: ""
  };

  constructor(props: any) {
    super(props);
  }
  public render() {
    const { inputValue } = this.state;

    return (
      <div className="App">
        <Graph inputValue={inputValue}/>
          <input
            type="text"
            id="uname"
            name="uname"
            value={this.state.inputValue}
            // tslint:disable:jsx-no-lambda
            onChange={evt => this.updateInputValue(evt)}
            placeholder="New task"
          />
      </div>
    );
  }

  private updateInputValue = (evt: any) => {
    evt.preventDefault();
    evt.stopPropagation()
    this.setState({
      inputValue: evt.target.value
    });
  };
}

export default Mindmap;
