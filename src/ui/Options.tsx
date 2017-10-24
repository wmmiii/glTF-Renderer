import * as React from 'react';

import { ModelDetail, SkyBoxDetail } from './Details';

interface OptionsProps {
  models: Array<{
    title: string,
    url: string
  }>;
  defaultModel: number;
  onModelChange: (model: ModelDetail) => void;

  skyBoxes: Array<{
    title: string,
    url: string
  }>;
  defaultSkyBox: number;
  onSkyBoxChange: (skyBox: SkyBoxDetail) => void;
}

export default class Options extends React.Component<OptionsProps> {
  render() {
    return <div className="options">
      <label>
        Model: <Selector
          default={this.props.defaultModel}
          options={this.props.models.map((model) => {
            return { key: model.title, value: model };
          })}
          onChange={(model: ModelDetail) => this.props.onModelChange(model)}
        />
      </label>
      <label>
        Sky box: <Selector
          default={this.props.defaultSkyBox}
          options={this.props.skyBoxes.map((skyBox) => {
            return { key: skyBox.title, value: skyBox };
          })}
          onChange={(skyBox: SkyBoxDetail) => this.props.onSkyBoxChange(skyBox)}
        />
      </label>
    </div>;
  }
}

interface SelectorProps<T> {
  default: number;
  options: Array<{
    key: string,
    value: T
  }>;
  onChange: (option: T) => void;
}

interface SelectorState {
  value: number;
}

class Selector<T> extends
  React.Component<SelectorProps<T>, SelectorState> {
  constructor(props: SelectorProps<T>) {
    super(props);
    this.state = { value: props.default };

    this.handleSelectChanged = this.handleSelectChanged.bind(this);
  }

  render() {
    return <select value={this.state.value} onChange={this.handleSelectChanged}>
      {this.props.options.map((option, index) => {
        return <option key={option.key} value={index}>{option.key}</option>;
      })};
      </select>;
  }

  private handleSelectChanged(event: React.FormEvent<HTMLSelectElement>): void {
    const index = parseInt(event.currentTarget.value, 10);
    this.setState({
      value: index
    });
    this.props.onChange(this.props.options[index].value);
  }
}
