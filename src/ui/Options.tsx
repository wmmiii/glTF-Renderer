import * as React from "react";

import { ModelDetail, SkyBoxDetail } from "./Details";

interface OptionsProps {
  models: {
    title: string,
    url: string
  }[];
  defaultModel: number;
  onModelChange: (model: ModelDetail) => void;

  skyBoxes: {
    title: string,
    url: string
  }[];
  defaultSkyBox: number;
  onSkyBoxChange: (skyBox: SkyBoxDetail) => void;
}

export default class Options extends React.Component<OptionsProps> {
  render() {
    return <div className="options">
      <label>
        Model: <ModelSelector
          default={this.props.defaultModel}
          models={this.props.models}
          onModelChange={(model) => this.props.onModelChange(model)}
        />
      </label>
      <label>
        Sky box: <SkyBoxSelector
          default={this.props.defaultSkyBox}
          skyBoxes={this.props.skyBoxes}
          onSkyBoxChange={(skyBox) => this.props.onSkyBoxChange(skyBox)}
        />
      </label>
    </div>;
  }
}


interface ModelSelectorProps {
  default: number;
  models: ModelDetail[];
  onModelChange: (model: ModelDetail) => void;
}

interface ModelSelectorState {
  value: number;
}

class ModelSelector extends
  React.Component<ModelSelectorProps, ModelSelectorState> {
  constructor(props: ModelSelectorProps) {
    super(props);
    this.state = { value: props.default };

    this.handleSelectChanged = this.handleSelectChanged.bind(this);
  }

  render() {
    return <select value={this.state.value} onChange={this.handleSelectChanged}>
      {this.props.models.map((model, index) => {
        return <option key={model.url} value={index}>{model.title}</option>
      })};
      </select>;
  }

  private handleSelectChanged(event: React.FormEvent<HTMLSelectElement>): void {
    const index = parseInt(event.currentTarget.value);
    this.setState({
      value: index
    });
    this.props.onModelChange(this.props.models[index]);
  }
}


interface SkyBoxSelectorProps {
  default: number;
  skyBoxes: SkyBoxDetail[];
  onSkyBoxChange: (skyBox: SkyBoxDetail) => void;
}

interface SkyBoxSelectorState {
  value: number;
}

class SkyBoxSelector extends
  React.Component<SkyBoxSelectorProps, SkyBoxSelectorState> {
  constructor(props: SkyBoxSelectorProps) {
    super(props);
    this.state = { value: props.default };

    this.handleSelectChanged = this.handleSelectChanged.bind(this);
  }

  render() {
    return <select value={this.state.value} onChange={this.handleSelectChanged}>
      {this.props.skyBoxes.map((skyBox, index) => {
        return <option key={skyBox.url} value={index}>{skyBox.title}</option>
      })};
      </select>;
  }

  private handleSelectChanged(event: React.FormEvent<HTMLSelectElement>): void {
    const index = parseInt(event.currentTarget.value);
    this.setState({
      value: index
    });
    this.props.onSkyBoxChange(this.props.skyBoxes[index]);
  }
}