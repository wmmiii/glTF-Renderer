import * as React from 'react';
import * as ReactDom from 'react-dom';

import Attribution from './Attribution';
import Options from './Options';
import { ModelDetail, SkyBoxDetail } from './Details';

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
        skyBoxCreator={this.state.currentSkyBox.creator}
      />
      <Options
        skyBoxes={this.props.skyBoxes}
        defaultSkyBox={this.props.defaultSkyBox}
        onSkyBoxChange={this.handleSkyBoxChange}
        models={[]}
      />
    </div>
  }
}

export function initializeApp(models: ModelDetail[], defaultModel: number,
  onModelChange: (modelUrl: string) => void, skyBoxes: SkyBoxDetail[],
  defaultSkyBox: number, onSkyBoxChange: (skyBoxUrl: string) => void) {
  ReactDom.render(<App
    models={models}
    onModelChange={onModelChange}
    defaultModel={defaultModel}
    skyBoxes={skyBoxes}
    onSkyBoxChange={onSkyBoxChange}
    defaultSkyBox={defaultSkyBox}
  />, document.getElementById('app'));
}