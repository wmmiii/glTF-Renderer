import * as React from 'react';

import { Author, ModelDetail } from './Details';

interface AttributionProps {
  model: ModelDetail;
  skyBoxCreator: Author | undefined;
}

export default class Attribution extends React.Component<AttributionProps> {
  render() {
    return <div className="attribution">
      <ul>
        <li className="large">
          <a href="https://github.com/wmmiii/glTF-Renderer">
            glTF Renderer
          </a> by William Martin
        </li>
        {this.props.model !== undefined && this.props.model.creator &&
          <li>
            {this.props.model.title} by <a href={this.props.model.creator.url}>
              {this.props.model.creator.name}
            </a>
          </li>
        }
        {this.props.skyBoxCreator !== undefined &&
          <li>
            Sky Box by <a href={this.props.skyBoxCreator.url}>
              {this.props.skyBoxCreator.name}
            </a>
          </li>
        }
      </ul>
    </div >;
  }
}
