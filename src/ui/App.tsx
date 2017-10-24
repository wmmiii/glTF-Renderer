import * as React from 'react';
import * as ReactDom from 'react-dom';

import Attribution from './Attribution';
import { ModelDetail, SkyBoxDetail } from './Details';
import Options from './Options';

interface AppProps {
  models: ModelDetail[];
  defaultModel: number;
  onModelChange: (modelUrl: string) => void;
  skyBoxes: SkyBoxDetail[];
  defaultSkyBox: number;
  onSkyBoxChange: (skyBoxUrl: string) => void;
}

interface AppState {
  currentModel: ModelDetail;
  currentSkyBox: SkyBoxDetail;
}

export class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      currentModel: this.props.models[this.props.defaultModel],
      currentSkyBox: this.props.skyBoxes[this.props.defaultSkyBox]
    };

    this.handleModelChange = this.handleModelChange.bind(this);
    this.handleSkyBoxChange = this.handleSkyBoxChange.bind(this);
  }

  handleModelChange(model: ModelDetail) {
    this.props.onModelChange(model.url);
    this.setState({ currentModel: model });
  }

  handleSkyBoxChange(skyBox: SkyBoxDetail) {
    this.props.onSkyBoxChange(skyBox.url);
    this.setState({ currentSkyBox: skyBox });
  }

  render() {
    return <div>
      <Attribution
        model={this.state.currentModel}
        skyBoxCreator={this.state.currentSkyBox.creator}
      />
      <Options
        models={this.props.models}
        defaultModel={this.props.defaultModel}
        onModelChange={this.handleModelChange}
        skyBoxes={this.props.skyBoxes}
        defaultSkyBox={this.props.defaultSkyBox}
        onSkyBoxChange={this.handleSkyBoxChange}
      />
    </div>;
  }
}

export function initializeApp(models: ModelDetail[],
                              defaultModel: number,
                              onModelChange: (modelUrl: string) => void,
                              skyBoxes: SkyBoxDetail[],
                              defaultSkyBox: number,
                              onSkyBoxChange: (skyBoxUrl: string) => void) {
  ReactDom.render(<App
    models={models}
    onModelChange={onModelChange}
    defaultModel={defaultModel}
    skyBoxes={skyBoxes}
    onSkyBoxChange={onSkyBoxChange}
    defaultSkyBox={defaultSkyBox}
  />, document.getElementById('app'));
}
